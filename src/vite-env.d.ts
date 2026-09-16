/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_SITE_URL?: string
  /** StackLogger application key — never commit the real value. */
  readonly VITE_STACKLOGGER_KEY?: string
  /** Origin registered in StackLogger settings (defaults to VITE_SITE_URL). */
  readonly VITE_STACKLOGGER_ORIGIN?: string
  /** Override ingest URL (defaults to StackLogger cloud ingest). */
  readonly VITE_STACKLOGGER_INGEST_URL?: string
  readonly VITE_APP_ENV?: string
  readonly VITE_APP_RELEASE?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_APP_REGION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
