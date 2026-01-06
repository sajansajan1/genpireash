/**
 * Background Execution Utilities
 *
 * Provides non-blocking execution patterns for server-side operations
 * using process.nextTick and setImmediate for proper event loop scheduling
 *
 * Based on Node.js event loop best practices:
 * - process.nextTick: Execute immediately after current operation, before I/O
 * - setImmediate: Execute after I/O events in the event loop
 *
 * Use Cases:
 * - Vision API analysis after image generation (non-blocking)
 * - Background cache population
 * - Async logging and analytics
 * - Non-critical database updates
 */

export type BackgroundTask<T = void> = () => Promise<T>;

export interface BackgroundTaskOptions {
  /** Called when task completes successfully */
  onSuccess?: (result: any) => void;

  /** Called when task fails */
  onError?: (error: Error) => void;

  /** Maximum execution time in milliseconds */
  timeout?: number;

  /** Number of retry attempts on failure */
  retries?: number;

  /** Delay between retries in milliseconds (default: exponential backoff) */
  retryDelay?: number;
}

/**
 * Execute a task in the background without blocking the current execution
 * Uses setImmediate to schedule task after I/O events
 *
 * @example
 * ```typescript
 * // Non-blocking Vision API analysis
 * executeInBackground(
 *   async () => {
 *     const result = await analyzeImage(imageUrl);
 *     await saveToCache(result);
 *     return result;
 *   },
 *   {
 *     onSuccess: (result) => console.log('Analysis cached:', result),
 *     onError: (error) => console.error('Analysis failed:', error),
 *     timeout: 30000, // 30 seconds
 *     retries: 2
 *   }
 * );
 * // Code continues immediately, analysis runs in background
 * ```
 *
 * @param task - Async function to execute in background
 * @param options - Configuration options
 */
export function executeInBackground<T = void>(
  task: BackgroundTask<T>,
  options: BackgroundTaskOptions = {}
): void {
  const {
    onSuccess,
    onError,
    timeout,
    retries = 0,
    retryDelay
  } = options;

  // Schedule execution after current I/O operations
  setImmediate(async () => {
    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        let result: T;

        if (timeout) {
          // Create timeout promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
              () => reject(new Error(`Background task timeout after ${timeout}ms`)),
              timeout
            );
          });

          // Race between task and timeout
          result = await Promise.race([task(), timeoutPromise]);
        } else {
          // Execute without timeout
          result = await task();
        }

        // Task succeeded - notify via callback
        if (onSuccess) {
          process.nextTick(() => onSuccess(result));
        }

        return; // Exit retry loop on success

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        console.error(
          `[Background Task] Error on attempt ${attempt + 1}/${retries + 1}:`,
          lastError.message
        );

        // If we have more retries, wait before next attempt
        if (attempt < retries) {
          const delay = retryDelay || Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`[Background Task] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed - notify via error callback
    if (onError && lastError) {
      process.nextTick(() => onError(lastError));
    }
  });
}

/**
 * Execute multiple tasks in background with concurrency limit
 * Useful for batch operations like analyzing multiple images
 *
 * @example
 * ```typescript
 * const tasks = imageUrls.map(url => () => analyzeImage(url));
 *
 * executeInBackgroundBatch(
 *   tasks,
 *   3, // Max 3 concurrent analyses
 *   {
 *     onSuccess: (results) => console.log('All analyses complete:', results.length),
 *     onError: (error) => console.error('Some analyses failed:', error)
 *   }
 * );
 * ```
 *
 * @param tasks - Array of async functions to execute
 * @param maxConcurrent - Maximum concurrent executions (default: 5)
 * @param options - Configuration options
 */
export function executeInBackgroundBatch<T = void>(
  tasks: BackgroundTask<T>[],
  maxConcurrent: number = 5,
  options: BackgroundTaskOptions = {}
): void {
  setImmediate(async () => {
    const results: T[] = [];
    const errors: Error[] = [];

    console.log(
      `[Background Batch] Starting ${tasks.length} tasks with concurrency ${maxConcurrent}`
    );

    // Process tasks in batches
    for (let i = 0; i < tasks.length; i += maxConcurrent) {
      const batch = tasks.slice(i, i + maxConcurrent);

      console.log(
        `[Background Batch] Processing batch ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(tasks.length / maxConcurrent)}`
      );

      const batchResults = await Promise.allSettled(
        batch.map(task => task())
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const error = result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason));
          errors.push(error);
          console.error(
            `[Background Batch] Task ${i + index + 1} failed:`,
            error.message
          );
        }
      });
    }

    console.log(
      `[Background Batch] Complete: ${results.length} succeeded, ${errors.length} failed`
    );

    // Notify callbacks
    if (options.onSuccess && results.length > 0) {
      process.nextTick(() => options.onSuccess!(results));
    }

    if (options.onError && errors.length > 0) {
      process.nextTick(() => options.onError!(errors[0]));
    }
  });
}

/**
 * Schedule a task to run in the next tick of the event loop
 * Use for high-priority background tasks that should run before I/O
 *
 * @example
 * ```typescript
 * scheduleNextTick(async () => {
 *   await updateCache(data);
 * });
 * // Runs immediately after current operation, before any I/O
 * ```
 *
 * @param task - Function to execute (sync or async)
 */
export function scheduleNextTick(task: () => void | Promise<void>): void {
  process.nextTick(async () => {
    try {
      await task();
    } catch (error) {
      console.error('[Next Tick Task] Error:', error);
    }
  });
}

/**
 * Execute a task immediately after the current event loop
 * Similar to executeInBackground but for simpler use cases
 *
 * @example
 * ```typescript
 * scheduleImmediate(async () => {
 *   await logAnalytics(event);
 * });
 * // Runs after I/O events
 * ```
 *
 * @param task - Function to execute (sync or async)
 */
export function scheduleImmediate(task: () => void | Promise<void>): void {
  setImmediate(async () => {
    try {
      await task();
    } catch (error) {
      console.error('[Immediate Task] Error:', error);
    }
  });
}

/**
 * Delay execution helper
 * Useful for implementing custom retry logic or rate limiting
 *
 * @param ms - Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute with exponential backoff retry
 * Automatically retries with increasing delays
 *
 * @example
 * ```typescript
 * const result = await executeWithBackoff(
 *   async () => await apiCall(),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 *
 * @param task - Task to execute
 * @param options - Retry configuration
 */
export async function executeWithBackoff<T>(
  task: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2
  } = options;

  let lastError: Error;
  let currentDelay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        console.log(
          `[Backoff] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${currentDelay}ms`
        );
        await delay(currentDelay);
        currentDelay = Math.min(currentDelay * factor, maxDelay);
      }
    }
  }

  throw lastError!;
}
