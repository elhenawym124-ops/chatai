import winston from 'winston';
import path from 'path';
import fs from 'fs';

/**
 * Enhanced Logger with structured logging, correlation IDs, and performance tracking
 */

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    const meta = Object.keys(metadata || {}).length ? JSON.stringify(metadata, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${meta}`;
  })
);

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { 
    service: 'communication-platform-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
    // Performance logs
    new winston.transports.File({
      filename: path.join(logsDir, 'performance.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          return info.type === 'performance' ? info : false;
        })()
      ),
    }),
  ],
});

// Console logging for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

/**
 * Enhanced Logger Class with additional features
 */
class EnhancedLogger {
  private correlationId: string | null = null;
  private startTime: number | null = null;

  /**
   * Set correlation ID for request tracking
   */
  setCorrelationId(id: string): void {
    this.correlationId = id;
  }

  /**
   * Clear correlation ID
   */
  clearCorrelationId(): void {
    this.correlationId = null;
  }

  /**
   * Start performance timer
   */
  startTimer(): void {
    this.startTime = Date.now();
  }

  /**
   * End performance timer and log duration
   */
  endTimer(operation: string, metadata?: any): void {
    if (this.startTime) {
      const duration = Date.now() - this.startTime;
      this.performance(operation, duration, metadata);
      this.startTime = null;
    }
  }

  /**
   * Log with correlation ID
   */
  private logWithCorrelation(level: string, message: string, metadata?: any): void {
    const logData = {
      ...metadata,
      ...(this.correlationId && { correlationId: this.correlationId }),
    };

    (logger as any)[level](message, logData);
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: any): void {
    this.logWithCorrelation('debug', message, metadata);
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: any): void {
    this.logWithCorrelation('info', message, metadata);
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: any): void {
    this.logWithCorrelation('warn', message, metadata);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, metadata?: any): void {
    const errorData = {
      ...metadata,
      ...(error instanceof Error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      }),
      ...(error && typeof error === 'object' && !(error instanceof Error) && { error }),
    };

    this.logWithCorrelation('error', message, errorData);
  }

  /**
   * Performance logging
   */
  performance(operation: string, duration: number, metadata?: any): void {
    this.logWithCorrelation('info', `Performance: ${operation}`, {
      type: 'performance',
      operation,
      duration,
      ...metadata,
    });
  }

  /**
   * HTTP request logging
   */
  http(method: string, url: string, statusCode: number, duration: number, metadata?: any): void {
    this.logWithCorrelation('info', `HTTP ${method} ${url}`, {
      type: 'http',
      method,
      url,
      statusCode,
      duration,
      ...metadata,
    });
  }

  /**
   * Database query logging
   */
  database(query: string, duration: number, metadata?: any): void {
    this.logWithCorrelation('debug', `Database query: ${query}`, {
      type: 'database',
      query,
      duration,
      ...metadata,
    });
  }

  /**
   * Security event logging
   */
  security(event: string, metadata?: any): void {
    this.logWithCorrelation('warn', `Security event: ${event}`, {
      type: 'security',
      event,
      ...metadata,
    });
  }

  /**
   * Business logic logging
   */
  business(event: string, metadata?: any): void {
    this.logWithCorrelation('info', `Business event: ${event}`, {
      type: 'business',
      event,
      ...metadata,
    });
  }
}

// Create enhanced logger instance
export const enhancedLogger = new EnhancedLogger();

// Create a stream object for Morgan HTTP request logging
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Export both for backward compatibility
export { logger as default };
