import { t, ti } from '../i18n';

// Attempts to extract a localized message from a backend error payload.
// Supports various shapes, e.g.:
// - { i18n: { key: 'tooCloseToDoghouse', params: { n: 50 } } }
// - { i18nKey: 'tooCloseToDoghouse', i18nParams: { n: 50 } }
// - { messageKey: 'tooCloseToDoghouse', params: { n: 50 } }
// - { key: 'tooCloseToDoghouse', params: { n: 50 } }
// - { message: 'Plain string message' }
export function getI18nMessage(err: any): string | null {
  const data = err?.response?.data ?? err?.data ?? err;

  if (!data) return null;

  // Plain string message
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;

  // Nested i18n object
  const i18nObj = data?.i18n || data?.error || null;
  if (i18nObj && typeof i18nObj === 'object') {
    const key: string | undefined = i18nObj.key || i18nObj.i18nKey || i18nObj.messageKey;
    const params: Record<string, any> | undefined = i18nObj.params || i18nObj.i18nParams;
    if (key) {
      if (params && typeof params === 'object' && Object.keys(params).length > 0) {
        return ti(key as any, params);
      }
      return t(key as any);
    }
  }

  // Top-level keys
  const keyTop: string | undefined = data?.i18nKey || data?.messageKey || data?.key;
  const paramsTop: Record<string, any> | undefined = data?.i18nParams || data?.params;
  if (keyTop) {
    if (paramsTop && typeof paramsTop === 'object' && Object.keys(paramsTop).length > 0) {
      return ti(keyTop as any, paramsTop);
    }
    return t(keyTop as any);
  }

  return null;
}
