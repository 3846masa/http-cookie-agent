import 'tough-cookie';

declare module 'tough-cookie' {
  import type { Store } from 'tough-cookie';

  interface CookieJar {
    store: Store;
  }
}
