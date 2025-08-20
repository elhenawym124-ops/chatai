import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '@/config';

/**
 * Logger Configuration
 * 
 * Centralized logging system using Winston with file rotation,
 * different log levels, and structured logging for better monitoring.
 */

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(logColors);

/**
 * Custom log format for console output
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

/**
 * Custom log format for file output
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create transports array
 */
const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [];

  // Console transport for development
  if (config.env === 'development') {
    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: consoleFormat,
      })
    );
  } else {
    // Console transport for production (less verbose)
    transports.push(
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  // File transport for all logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: config.logging.level,
      format: fileFormat,
    })
  );

  // Separate file for error logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: fileFormat,
    })
  );

  // HTTP access logs
  transports.push(
    new DailyRotateFile({
      filename: 'logs/access-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      level: 'http',
      format: fileFormat,
    })
  );

  return transports;
};

/**
 * Create Winston logger instance
 */
const createLogger = (): winston.Logger => {
  return winston.createLogger({
    level: config.logging.level,
    levels: logLevels,
    format: fileFormat,
    transports: createTransports(),
    exitOnError: false,
    
    // Handle uncaught exceptions
    exceptionHandlers: [
      new DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
      }),
    ],
    
    // Handle unhandled promise rejections
    rejectionHandlers: [
      new DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '30d',
        format: fileFormat,
      }),
    ],
  });
};

// Create logger instance
export const logger = createLogger();

/**
 * Logger utility functions
 */
export const loggerUtils = {
  /**
   * Log database query
   */
  logQuery: (query: string, duration: number, params?: any): void => {
    logger.debug('Database query executed', {
      query,
      duration: `${duration}ms`,
      params,
      type: 'database',
    });
  },

  /**
   * Log API request
   */
  logRequest: (method: string, url: string, statusCode: number, duration: number, userId?: string): void => {
    logger.http('API request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
      type: 'api',
    });
  },

  /**
   * Log authentication event
   */
  logAuth: (event: string, userId: string, ip: string, success: boolean): void => {
    const level = success ? 'info' : 'warn';
    logger.log(level, 'Authentication event', {
      event,
      userId,
      ip,
      success,
      type: 'auth',
    });
  },

  /**
   * Log business event
   */
  logBusiness: (event: string, data: any, userId?: string): void => {
    logger.info('Business event', {
      event,
      data,
      userId,
      type: 'business',
    });
  },

  /**
   * Log security event
   */
  logSecurity: (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium'): void => {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    logger.log(level, 'Security event', {
      event,
      details,
      severity,
      type: 'security',
    });
  },

  /**
   * Log external service call
   */
  logExternalService: (service: string, operation: string, duration: number, success: boolean, error?: any): void => {
    const level = success ? 'info' : 'error';
    logger.log(level, 'External service call', {
      service,
      operation,
      duration: `${duration}ms`,
      success,
      error: error?.message,
      type: 'external',
    });
  },

  /**
   * Log performance metric
   */
  logPerformance: (metric: string, value: number, unit: string, context?: any): void => {
    logger.info('Performance metric', {
      metric,
      value,
      unit,
      context,
      type: 'performance',
    });
  },

  /**
   * Log user action
   */
  logUserAction: (action: string, userId: string, resourceType?: string, resourceId?: string, metadata?: any): void => {
    logger.info('User action', {
      action,
      userId,
      resourceType,
      resourceId,
      metadata,
      type: 'user_action',
    });
  },

  /**
   * Log system event
   */
  logSystem: (event: string, details: any): void => {
    logger.info('System event', {
      event,
      details,
      type: 'system',
    });
  },
};

/**
 * Create child logger with additional context
 */
export const createChildLogger = (context: any): winston.Logger => {
  return logger.child(context);
};

/**
 * Stream for Morgan HTTP logger
 */
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

// Ensure logs directory exists
import { existsSync, mkdirSync } from 'fs';
if (!existsSync('logs')) {
  mkdirSync('logs', { recursive: true });
}

export default logger;
