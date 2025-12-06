/**
 * Logger utility for web application
 * Provides structured logging with environment-aware behavior
 */

import { env } from "../config";

type LogLevel = "log" | "warn" | "error" | "info" | "debug";

interface LoggerOptions {
  /**
   * Minimum log level to output
   * Logs below this level will be ignored
   */
  minLevel?: LogLevel;
  /**
   * Whether to enable logging in production
   * @default false
   */
  enableInProduction?: boolean;
  /**
   * Custom prefix for log messages
   */
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
};

class Logger {
  private minLevel: LogLevel;
  private enabled: boolean;
  private prefix?: string;

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel || (env.isDev ? "debug" : "warn");
    this.enabled = env.isDev || options.enableInProduction === true;
    this.prefix = options.prefix;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(...args: unknown[]): unknown[] {
    if (this.prefix) {
      return [`[${this.prefix}]`, ...args];
    }
    return args;
  }

  log(...args: unknown[]): void {
    if (!this.shouldLog("log")) return;
    console.log(...this.formatMessage(...args));
  }

  info(...args: unknown[]): void {
    if (!this.shouldLog("info")) return;
    console.info(...this.formatMessage(...args));
  }

  warn(...args: unknown[]): void {
    if (!this.shouldLog("warn")) return;
    console.warn(...this.formatMessage(...args));
  }

  error(...args: unknown[]): void {
    if (!this.shouldLog("error")) return;
    console.error(...this.formatMessage(...args));
  }

  debug(...args: unknown[]): void {
    if (!this.shouldLog("debug")) return;
    console.debug(...this.formatMessage(...args));
  }

  /**
   * Create a new logger instance with custom options
   */
  create(options: LoggerOptions): Logger {
    return new Logger({
      minLevel: options.minLevel ?? this.minLevel,
      enableInProduction: options.enableInProduction ?? (env.isDev ? undefined : false),
      prefix: options.prefix ?? this.prefix,
    });
  }
}

/**
 * Default logger instance
 * - In development: logs all levels (debug and above)
 * - In production: only logs warnings and errors
 */
export const logger = new Logger();

/**
 * Create a logger with a custom prefix
 */
export function createLogger(prefix: string, options?: Omit<LoggerOptions, "prefix">): Logger {
  return new Logger({ ...options, prefix });
}
