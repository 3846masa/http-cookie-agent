import type { CookieJar } from 'tough-cookie';

interface CookieOptions {
  async_UNSTABLE?: true;
  jar: CookieJar;
}

export type { CookieOptions };
