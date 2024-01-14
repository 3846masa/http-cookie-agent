import { createRequire } from 'node:module';

import type { CookieOptions } from '../cookie_options';

const require = 'require' in globalThis ? globalThis.require : createRequire(import.meta.url);

type Params = {
  cookieOptions: CookieOptions;
  cookies: string | string[] | undefined;
  requestUrl: string;
};

export function saveCookiesFromHeader({ cookieOptions, cookies, requestUrl }: Params): void {
  const { async_UNSTABLE = false, jar } = cookieOptions;

  const setCookieSync = async_UNSTABLE
    ? // eslint-disable-next-line @typescript-eslint/no-var-requires
      (require('deasync') as typeof import('deasync'))(jar.setCookie.bind(jar))
    : jar.setCookieSync.bind(jar);

  for (const cookie of [cookies].flat()) {
    if (cookie == null) {
      continue;
    }
    setCookieSync(cookie, requestUrl, { ignoreError: true });
  }
}
