export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

function toText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Error) {
    return value.stack || value.message;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function formatMessage(message: string, args: unknown[]): string {
  if (args.length === 0) {
    return message;
  }
  return [message, ...args.map(toText)].join(" ");
}

function log(level: LogLevel, message: string, ...args: unknown[]): void {
  const text = formatMessage(message, args);
  console.log(`[${level}]${text}`);
}

 function debug(message: string, ...args: unknown[]): void {
  log("DEBUG", message, ...args);
}

 function info(message: string, ...args: unknown[]): void {
  log("INFO", message, ...args);
}

 function warn(message: string, ...args: unknown[]): void {
  log("WARN", message, ...args);
}

 function error(message: string, ...args: unknown[]): void {
  log("ERROR", message, ...args);
}

// 对象形式导出，支持 logger.debug() 调用方式
const logger = {
  debug,
  info,
  warn,
  error,
};

export default logger;
