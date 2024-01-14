import { createRequire } from 'node:module';

import { Cookie } from 'tough-cookie';

import type { CookieOptions } from '../cookie_options';

const require = 'require' in globalThis ? globalThis.require : createRequire(import.meta.url);

type Params = {
  cookieOptions: CookieOptions;
  passedValues: (string | number | undefined | null)[];
  requestUrl: string;
};

export function createCookieHeaderValue({ cookieOptions, passedValues, requestUrl }: Params): string {
  const { async_UNSTABLE = false, jar } = cookieOptions;

  const getCookiesSync = async_UNSTABLE
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require('deasync') as typeof import('deasync'))(jar.getCookies.bind(jar))
    : jar.getCookiesSync.bind(jar);

  const cookies = getCookiesSync(requestUrl);
  const cookiesMap = new Map(cookies.map((cookie) => [cookie.key, cookie]));

  for (const passedValue of passedValues) {
    if (typeof passedValue !== 'string') {
      continue;
    }
    for (const str of passedValue.split(';')) {
      const cookie = Cookie.parse(str.trim());
      if (cookie != null) {
        cookiesMap.set(cookie.key, cookie);
      }
    }
  }

  const cookieHeaderValue = Array.from(cookiesMap.values())
    .map((cookie) => cookie.cookieString())
    .join(';\x20');

  return cookieHeaderValue;
}
