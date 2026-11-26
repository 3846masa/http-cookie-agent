import { Cookie } from 'tough-cookie';

import type { CookieOptions } from '../cookie_options';

type Params = {
  cookieOptions: CookieOptions;
  passedValues: (string | number | undefined | null)[];
  requestUrl: string;
};

export function createCookieHeaderValue({ cookieOptions, passedValues, requestUrl }: Params): string {
  const { jar } = cookieOptions;

  const cookiesMap = new Map<string, Cookie>();
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

  const jarCookies = jar.getCookiesSync(requestUrl).filter((cookie) => !cookiesMap.has(cookie.key));

  const cookieHeaderValue = [...jarCookies, ...cookiesMap.values()]
    .map((cookie) => cookie.cookieString())
    .join(';\x20');

  return cookieHeaderValue;
}
