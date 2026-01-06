import { NextResponse } from "next/server";
import { testAILogsConnection } from "@/lib/supabase/ai-logs";
import { aiLogger } from "@/lib/logging/ai-logger";

export async function GET() {
  try {
    // Test 1: Check database connection
    const connectionTest = await testAILogsConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: `Database connection failed: ${connectionTest.error}`,
        details: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Service role key set" : 
                       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Using anon key" : "No key found"
        }
      }, { status: 500 });
    }
    
    // Test 2: Create a test log entry
    const testLogger = aiLogger.startOperation(
      "testFunction",
      "gpt-4o",
      "openai",
      "text_generation"
    );
    
    testLogger.setInput({
      prompt: "Test prompt",
      parameters: {
        temperature: 0.7,
        max_tokens: 100
      }
    });
    
    testLogger.setOutput({
      content: "Test response",
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
        estimated_cost: 0.001
      }
    });
    
    testLogger.setContext({
      user_id: "test-user",
      feature: "test"
    });
    
    await testLogger.complete();
    
    // Force flush to ensure it's written
    await aiLogger.forceFlush();
    
    // Test 3: Fetch the logs to verify they were saved
    const logs = await aiLogger.getLogs({ limit: 5 });
    
    // Test 4: Get usage stats
    const stats = await aiLogger.getUsageStats();
    
    return NextResponse.json({
      success: true,
      message: "AI logging test completed",
      results: {
        connectionTest: connectionTest.success,
        testLogCreated: true,
        recentLogs: logs.length,
        stats: {
          total_requests: stats.total_requests,
          total_cost: stats.total_cost
        }
      }
    });
    
  } catch (error) {
    console.error("AI logging test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
