const DEBUG = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, data?: any) => {
    if (DEBUG) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  error: (message: string, error: any) => {
    if (DEBUG) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
  warn: (message: string, data?: any) => {
    if (DEBUG) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }
};