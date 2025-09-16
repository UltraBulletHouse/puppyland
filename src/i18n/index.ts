export type Locale =
  | 'en'
  | 'pl'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'pt'
  | 'zh'
  | 'ja'
  | 'hi'
  | 'ar'
  | 'bn'
  | 'ru'
  | 'ur';

let currentLocale: Locale = (localStorage.getItem('puppyland-language') as Locale) || 'en';

function applyDocumentLocale(locale: Locale) {
  try {
    document.documentElement.lang = locale;
    const rtlLocales = new Set<Locale>(['ar', 'ur']);
    document.documentElement.dir = rtlLocales.has(locale) ? 'rtl' : 'ltr';
  } catch {}
}
let translations: Record<string, any> = {};
let enTranslations: Record<string, any> = {};

async function loadTranslations(locale: Locale) {
  try {
    const langModule = await import(`./${locale}.json?raw`);
    translations = JSON.parse(langModule.default);
  } catch (error) {
    console.error(`Failed to load translation file for locale: ${locale}`, error);
    if (locale !== 'en') {
      await loadTranslations('en');
    }
  }
}

async function loadEnTranslations() {
  try {
    const langModule = await import('./en.json?raw');
    enTranslations = JSON.parse(langModule.default);
  } catch (error) {
    console.error(`Failed to load translation file for locale: en`, error);
  }
}

export const translationsReady = new Promise<void>(async (resolve) => {
  await Promise.all([loadTranslations(currentLocale), loadEnTranslations()]);
  applyDocumentLocale(currentLocale);
  resolve();
});

export async function setLocale(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem('puppyland-language', locale);
  await loadTranslations(locale);
  applyDocumentLocale(locale);
  window.dispatchEvent(new CustomEvent('locale-changed'));
}

function resolve(path: string, obj: any): string | null {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}

export function t(key: string): string {
  let resolved = resolve(key, translations);
  if (resolved) {
    return String(resolved);
  }
  resolved = resolve(key, enTranslations);
  if (resolved) {
    return String(resolved);
  }
  return key;
}

export function ti(key: string, params: Record<string, string | number>): string {
  const template = t(key);
  return Object.keys(params).reduce(
    (acc, k) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(params[k])),
    template
  );
}
