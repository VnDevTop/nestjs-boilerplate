import { registerAs } from '@nestjs/config';
import { AcceptLanguageLocaleResolver, HeaderLocaleResolver, JsonI18nLoader, QueryLocaleResolver } from "@nestjs/i18n";
import { join } from "node:path";

/**
 * Internationalization configuration namespace.
 *
 * Language and locale settings are read from environment variables:
 * - I18N_DEFAULT_LOCALE: Default locale code (default: 'en')
 * - I18N_SUPPORTED_LOCALES: Comma-separated list of supported locale codes (default: 'cn,en,fr,ru,vi')
 * - I18N_QUERY_LOCALE: Query parameter name for locale switching (default: 'lang')
 * - I18N_HEADER_LOCALE: Header name for locale switching (default: 'x-lang')
 */
export const i18nConfig = registerAs(
  'i18n',
  () => ({
    defaultLocale: process.env.I18N_DEFAULT_LOCALE ?? 'en',
    supportedLocales: (process.env.I18N_SUPPORTED_LOCALES ?? 'cn,en,fr,ru,vi').split(','),
    fallbacks: { 'en-US': 'en' },
    loader: new JsonI18nLoader({
      path: join(process.cwd(), 'src', 'modules', 'i18n'),
    }),
    resolvers: [
      new QueryLocaleResolver(process.env.I18N_QUERY_LOCALE ?? 'lang'),
      new HeaderLocaleResolver(process.env.I18N_HEADER_LOCALE ?? 'x-lang'),
      new AcceptLanguageLocaleResolver(),
    ],
  })
);