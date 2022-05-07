import type { CookieOptions } from '../cookie_options';

type ModuleResolver = (id: string) => string;

function validateCookieOptions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opts: any,
  resolver: ModuleResolver = require.resolve,
): asserts opts is CookieOptions {
  if (!('jar' in opts)) {
    throw new TypeError('invalid cookies.jar');
  }

  if (opts.async_UNSTABLE) {
    try {
      resolver('deasync');
    } catch (_err) {
      throw new Error('you should install deasync library when cookies.async_UNSTABLE is true.');
    }
  } else {
    if (!opts.jar.store.synchronous) {
      throw new TypeError('you should set cookies.async_UNSTABLE to true for using the asynchronous cookie store.');
    }
  }
}

export { validateCookieOptions };
