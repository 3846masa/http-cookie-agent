import type { CookieOptions } from '../cookie_options';

type Params = {
  cookieOptions: CookieOptions;
  cookies: string | number | string[] | undefined;
  requestUrl: string;
};

export function saveCookiesFromHeader({ cookieOptions, cookies, requestUrl }: Params): void {
  const { jar } = cookieOptions;

  for (const cookie of [cookies].flat()) {
    if (cookie == null) {
      continue;
    }
    jar.setCookieSync(String(cookie), requestUrl, { ignoreError: true });
  }
}
