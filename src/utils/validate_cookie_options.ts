import type { CookieOptions } from '../cookie_options';

function validateCookieOptions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opts: any,
): asserts opts is CookieOptions {
  if (!('jar' in opts)) {
    throw new TypeError('invalid cookies.jar');
  }
  if (!opts.jar.store.synchronous) {
    throw new TypeError('an asynchronous cookie store is not supported.');
  }
}

export { validateCookieOptions };
