type LogLevel = "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

const configLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function log(
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
) {
  if (LOG_LEVELS[level] < LOG_LEVELS[configLevel]) return;

  queueMicrotask(() => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
    };

    if (level === "error") {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  });
}

export const logger = {
  info: (message: string, data?: Record<string, unknown>) =>
    log("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) =>
    log("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) =>
    log("error", message, data),
};
