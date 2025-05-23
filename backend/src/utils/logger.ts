export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface Logger {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

export const logger: Logger = {
  info: (...args) => {
    // Replace with metrics provider integration
    console.info('[INFO]', ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },
  debug: (...args) => {
    console.debug('[DEBUG]', ...args);
  },
};
