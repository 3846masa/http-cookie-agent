import { Cookie } from 'tough-cookie';

import type { CookieOptions } from '../cookie_options';

type Params = {
  cookieOptions: CookieOptions;
  passedValues: (string | number | undefined | null)[];
  requestUrl: string;
};

export function createCookieHeaderValue({ cookieOptions, passedValues, requestUrl }: Params): string {
  const { jar } = cookieOptions;

  const cookies = jar.getCookiesSync(requestUrl);
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
