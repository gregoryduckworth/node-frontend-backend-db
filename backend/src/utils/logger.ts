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
    if (!process.env.JEST) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args) => {
    if (!process.env.JEST) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    if (!process.env.JEST) {
      console.error('[ERROR]', ...args);
    }
  },
  debug: (...args) => {
    if (!process.env.JEST) {
      console.debug('[DEBUG]', ...args);
    }
  },
};
