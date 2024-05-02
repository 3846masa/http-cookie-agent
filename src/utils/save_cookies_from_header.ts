import type { CookieOptions } from '../cookie_options';

type Params = {
  cookieOptions: CookieOptions;
  cookies: string | string[] | undefined;
  requestUrl: string;
};

export function saveCookiesFromHeader({ cookieOptions, cookies, requestUrl }: Params): void {
  const { jar } = cookieOptions;

  for (const cookie of [cookies].flat()) {
    if (cookie == null) {
      continue;
    }
    jar.setCookieSync(cookie, requestUrl, { ignoreError: true });
  }
}
