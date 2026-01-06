/**
 * Development Logger Utility
 * Prevents console spam and potential crashes by throttling logs
 */

const LOG_THROTTLE_MS = 1000; // Only log once per second per key
const MAX_LOGS_PER_SESSION = 100; // Max logs per key per session

interface LogEntry {
  lastLogTime: number;
  count: number;
}

const logRegistry = new Map<string, LogEntry>();

/**
 * Throttled console.log that prevents spam
 * @param key - Unique identifier for this log location
 * @param data - Data to log
 * @param label - Optional label
 */
export function devLog(key: string, data: any, label?: string) {
  // Disable all logs in production
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const now = Date.now();
  const entry = logRegistry.get(key);

  // Initialize if first time
  if (!entry) {
    logRegistry.set(key, { lastLogTime: now, count: 1 });
    console.log(`[${key}]${label ? ` ${label}:` : ''}`, data);
    return;
  }

  // Check if we've exceeded max logs
  if (entry.count >= MAX_LOGS_PER_SESSION) {
    if (entry.count === MAX_LOGS_PER_SESSION) {
      console.warn(`[${key}] Max logs reached (${MAX_LOGS_PER_SESSION}). Suppressing further logs.`);
      entry.count++;
    }
    return;
  }

  // Check if enough time has passed since last log
  const timeSinceLastLog = now - entry.lastLogTime;
  if (timeSinceLastLog >= LOG_THROTTLE_MS) {
    console.log(`[${key}]${label ? ` ${label}:` : ''}`, data);
    entry.lastLogTime = now;
    entry.count++;
    logRegistry.set(key, entry);
  }
}

/**
 * Log once per component mount (useful for useEffect debugging)
 * @param key - Unique identifier
 * @param message - Message to log
 */
export function devLogOnce(key: string, message: string) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const entry = logRegistry.get(key);
  if (!entry || entry.count === 0) {
    console.log(`[${key}] ${message}`);
    logRegistry.set(key, { lastLogTime: Date.now(), count: 1 });
  }
}

/**
 * Enable debug mode to see all logs (for specific debugging sessions)
 */
let debugMode = false;

export function enableDebugMode() {
  debugMode = true;
  console.log('🔍 Debug mode enabled - all logs will show');
}

export function disableDebugMode() {
  debugMode = false;
  console.log('🔇 Debug mode disabled - logs throttled');
}

/**
 * Unthrottled log for debug mode
 */
export function debugLog(key: string, data: any, label?: string) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (debugMode) {
    console.log(`[DEBUG:${key}]${label ? ` ${label}:` : ''}`, data);
  } else {
    devLog(key, data, label);
  }
}

/**
 * Clear log registry (useful for testing)
 */
export function clearLogRegistry() {
  logRegistry.clear();
  console.log('🧹 Log registry cleared');
}
