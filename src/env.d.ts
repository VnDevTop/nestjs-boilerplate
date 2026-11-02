declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production' | 'test';
      PORT?: string;
      APP_NAME?: string;
      API_PREFIX?: string;
      API_VERSION?: string;
      APP_URL?: string;
      DATABASE_URL?: string;
      DB_SSL?: string;
      DB_SSL_REJECT_UNAUTHORIZED?: string;
      OBSERVE_APP_KEY?: string;
      OBSERVE_APP_SECRET?: string;
      OBSERVE_SERVICE_ID?: string;
      SWAGGER_TITLE?: string;
      SWAGGER_DESCRIPTION?: string;
      SWAGGER_VERSION?: string;
      SWAGGER_PATH?: string;
      SWAGGER_ADMIN_PATH?: string;
      SWAGGER_ENABLE_ADMIN?: string;
    }
  }
}

export {};