import type { CookieJar } from 'tough-cookie';

import type { CookieOptions } from '../cookie_options';

function validateCookieOptions(opts: object): asserts opts is CookieOptions {
  if (!('jar' in opts)) {
    throw new TypeError('invalid cookies.jar');
  }
  if (!(opts.jar as CookieJar).store.synchronous) {
    throw new TypeError('an asynchronous cookie store is not supported.');
  }
}

export { validateCookieOptions };
