declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;
      OBSERVE_APP_KEY?: string;
      OBSERVE_APP_SECRET?: string;
    }
  }
}

export {};