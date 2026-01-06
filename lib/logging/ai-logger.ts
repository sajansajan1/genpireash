import { v4 as uuidv4 } from "uuid";
import { insertAILogs, fetchAILogs, getAIUsageStats } from "@/lib/supabase/ai-logs";

export interface AILogEntry {
  id?: string;
  timestamp: string;
  model: string;
  provider: "openai" | "gemini" | "dalle" | "other";
  function_name: string;
  operation_type: "text_generation" | "image_generation" | "vision_analysis" | "embedding" | "moderation";
  input: {
    prompt?: string;
    system_prompt?: string;
    messages?: any[];
    image_url?: string;
    parameters?: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      size?: string;
      quality?: string;
      style?: string;
      n?: number;
    };
    metadata?: Record<string, any>;
  };
  output: {
    content?: string;
    images?: string[];
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
      estimated_cost?: number;
    };
    error?: string;
    raw_response?: any;
  };
  performance: {
    duration_ms: number;
    status: "success" | "error" | "timeout";
    retry_count?: number;
  };
  context: {
    user_id?: string;
    session_id?: string;
    tech_pack_id?: string;
    environment?: "development" | "staging" | "production";
    feature?: string;
    request_id?: string;
  };
}

class AILogger {
  private static instance: AILogger;
  private logs: AILogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private isDevelopment = process.env.NODE_ENV === "development";

  private constructor() {
    // Note: setInterval doesn't work in server actions as they're stateless
    // We'll flush immediately or in batches based on size
  }

  public static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  /**
   * Start logging an AI operation
   */
  public startOperation(
    functionName: string,
    model: string,
    provider: AILogEntry["provider"],
    operationType: AILogEntry["operation_type"]
  ): AIOperationLogger {
    return new AIOperationLogger(functionName, model, provider, operationType);
  }

  /**
   * Log a complete AI operation
   */
  public async log(entry: AILogEntry): Promise<void> {
    // Add timestamp if not present
    if (!entry.timestamp) {
      entry.timestamp = new Date().toISOString();
    }

    // Add request ID if not present
    if (!entry.context.request_id) {
      entry.context.request_id = uuidv4();
    }

    // Add environment
    entry.context.environment = (process.env.NODE_ENV as any) || "development";

    // Calculate estimated cost if tokens are available
    if (entry.output.usage && !entry.output.usage.estimated_cost) {
      entry.output.usage.estimated_cost = this.calculateCost(
        entry.model,
        entry.output.usage.prompt_tokens || 0,
        entry.output.usage.completion_tokens || 0
      );
    }

    // Console log in development
    if (this.isDevelopment) {
      this.logToConsole(entry);
    }

    // In server actions, we should flush immediately since they're stateless
    // Otherwise add to batch
    const isServerAction = typeof window === "undefined";
    
    if (isServerAction) {
      // Flush immediately for server actions
      try {
        await insertAILogs([entry]);
        console.log("AI log saved immediately (server action)");
      } catch (error) {
        console.error("Failed to save AI log:", error);
      }
    } else {
      // Client-side batching (though this shouldn't happen for AI ops)
      this.logs.push(entry);
      
      // Flush if batch is full
      if (this.logs.length >= this.batchSize) {
        await this.flush();
      }
    }
  }

  /**
   * Flush logs to database
   */
  private async flush(): Promise<void> {
    if (this.logs.length === 0) return;

    const logsToFlush = [...this.logs];
    this.logs = [];

    try {
      const { error } = await insertAILogs(logsToFlush);

      if (error) {
        console.error("Failed to flush AI logs to database:", error);
        // Re-add logs to queue for retry
        this.logs.unshift(...logsToFlush);
      } else {
        console.log(`Successfully flushed ${logsToFlush.length} AI logs to database`);
      }
    } catch (error) {
      console.error("Error flushing AI logs:", error);
      // Re-add logs to queue for retry
      this.logs.unshift(...logsToFlush);
    }
  }

  /**
   * Force flush all pending logs
   */
  public async forceFlush(): Promise<void> {
    await this.flush();
  }

  /**
   * Calculate estimated cost based on model and token usage
   */
  private calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const pricing: Record<string, { prompt: number; completion: number }> = {
      "gpt-4o": { prompt: 0.005, completion: 0.015 }, // per 1K tokens
      "gpt-4o-mini": { prompt: 0.00015, completion: 0.0006 },
      "gpt-4-turbo-preview": { prompt: 0.01, completion: 0.03 },
      "gpt-4": { prompt: 0.03, completion: 0.06 },
      "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
      "dall-e-3": { prompt: 0.04, completion: 0 }, // per image (HD quality)
      "dall-e-2": { prompt: 0.02, completion: 0 }, // per image
    };

    const modelPricing = pricing[model] || { prompt: 0, completion: 0 };
    
    return (
      (promptTokens / 1000) * modelPricing.prompt +
      (completionTokens / 1000) * modelPricing.completion
    );
  }

  /**
   * Enhanced console logging for development
   */
  private logToConsole(entry: AILogEntry): void {
    const colors = {
      reset: "\x1b[0m",
      bright: "\x1b[1m",
      dim: "\x1b[2m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      magenta: "\x1b[35m",
      cyan: "\x1b[36m",
    };

    const statusColor = entry.performance.status === "success" ? colors.green : colors.red;
    const duration = `${entry.performance.duration_ms}ms`;
    const tokens = entry.output.usage
      ? `Tokens: ${entry.output.usage.total_tokens} ($${entry.output.usage.estimated_cost?.toFixed(4)})`
      : "";

    console.log(
      `${colors.bright}${colors.cyan}[AI LOG]${colors.reset} ` +
      `${colors.blue}${entry.timestamp}${colors.reset}\n` +
      `${colors.bright}Function:${colors.reset} ${entry.function_name}\n` +
      `${colors.bright}Model:${colors.reset} ${colors.magenta}${entry.model}${colors.reset} (${entry.provider})\n` +
      `${colors.bright}Operation:${colors.reset} ${entry.operation_type}\n` +
      `${colors.bright}Status:${colors.reset} ${statusColor}${entry.performance.status}${colors.reset} (${duration})\n` +
      `${tokens ? `${colors.bright}Usage:${colors.reset} ${tokens}\n` : ""}` +
      `${colors.bright}Input:${colors.reset}`,
      entry.input,
      `\n${colors.bright}Output:${colors.reset}`,
      entry.output.content ? entry.output.content.substring(0, 200) + "..." : entry.output
    );

    if (entry.performance.status === "error" && entry.output.error) {
      console.error(`${colors.red}Error: ${entry.output.error}${colors.reset}`);
    }
  }

  /**
   * Get logs for a specific context
   */
  public async getLogs(filters: {
    user_id?: string;
    tech_pack_id?: string;
    session_id?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<AILogEntry[]> {
    const { data, error } = await fetchAILogs(filters);
    
    if (error) {
      console.error("Failed to fetch AI logs:", error);
      return [];
    }
    
    return data as AILogEntry[];
  }

  /**
   * Get usage statistics
   */
  public async getUsageStats(userId?: string, startDate?: string, endDate?: string): Promise<{
    total_requests: number;
    total_tokens: number;
    total_cost: number;
    by_model: Record<string, { requests: number; tokens: number; cost: number }>;
    by_operation: Record<string, { requests: number; tokens: number; cost: number }>;
    error_rate: number;
    average_duration_ms: number;
  }> {
    const stats = await getAIUsageStats(userId, startDate, endDate);
    
    if (!stats) {
      // Return empty stats if there's an error
      return {
        total_requests: 0,
        total_tokens: 0,
        total_cost: 0,
        by_model: {},
        by_operation: {},
        error_rate: 0,
        average_duration_ms: 0,
      };
    }
    
    return stats;
  }
}

/**
 * Helper class for logging individual AI operations
 */
export class AIOperationLogger {
  private startTime: number;
  private entry: Partial<AILogEntry>;

  constructor(
    functionName: string,
    model: string,
    provider: AILogEntry["provider"],
    operationType: AILogEntry["operation_type"]
  ) {
    this.startTime = Date.now();
    this.entry = {
      function_name: functionName,
      model,
      provider,
      operation_type: operationType,
      timestamp: new Date().toISOString(),
      input: {},
      output: {},
      performance: {
        duration_ms: 0,
        status: "success",
      },
      context: {},
    };
  }

  public setInput(input: AILogEntry["input"]): AIOperationLogger {
    this.entry.input = input;
    return this;
  }

  public setOutput(output: AILogEntry["output"]): AIOperationLogger {
    this.entry.output = output;
    return this;
  }

  public setContext(context: AILogEntry["context"]): AIOperationLogger {
    this.entry.context = context;
    return this;
  }

  public setError(error: string | Error): AIOperationLogger {
    this.entry.output = {
      ...this.entry.output,
      error: error instanceof Error ? error.message : error,
    };
    this.entry.performance = {
      ...this.entry.performance!,
      duration_ms: this.entry.performance?.duration_ms || 0,
      status: "error",
    };
    return this;
  }

  public setUsage(usage: AILogEntry["output"]["usage"]): AIOperationLogger {
    this.entry.output = {
      ...this.entry.output,
      usage,
    };
    return this;
  }

  public async complete(): Promise<void> {
    const duration = Date.now() - this.startTime;
    this.entry.performance = {
      ...this.entry.performance!,
      duration_ms: duration,
      status: this.entry.performance?.status || "success",
    };

    await AILogger.getInstance().log(this.entry as AILogEntry);
  }
}

// Export singleton instance
export const aiLogger = AILogger.getInstance();
