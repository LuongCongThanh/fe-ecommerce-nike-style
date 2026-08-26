import { describe, expect, it } from 'vitest';

import { createRequestConfig } from '../create-request-config';

describe('createRequestConfig', () => {
  it('falls back to the default locale when requestLocale resolves to undefined', async () => {
    const config = createRequestConfig(['common'], async () => ({}));

    const result = await config({ requestLocale: Promise.resolve(undefined) });

    expect(result.locale).toBe('vi');
  });

  it('merges every module message under its own key for the resolved locale', async () => {
    const loadMessages = async (locale: string, mod: string) => ({ [`${mod}-${locale}`]: 'value' });
    const config = createRequestConfig(['common', 'auth'], loadMessages);

    const result = await config({ requestLocale: Promise.resolve('en') });

    expect(result.messages).toEqual({
      common: { 'common-en': 'value' },
      auth: { 'auth-en': 'value' },
    });
  });
});
