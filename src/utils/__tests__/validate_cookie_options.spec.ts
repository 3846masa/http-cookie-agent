import { CookieJar } from 'tough-cookie';
import { expect, test } from 'vitest';

import { validateCookieOptions } from '../validate_cookie_options';

test('should throw Error when jar is not set', () => {
  expect(() => {
    validateCookieOptions({});
  }).toThrowError(
    expect.objectContaining({
      message: 'invalid cookies.jar',
    }) as Error,
  );
});

test('should throw Error when cookie store is asynchronous', () => {
  const jar = new CookieJar();
  jar.store.synchronous = false;

  expect(() => {
    validateCookieOptions({ jar });
  }).toThrowError(
    expect.objectContaining({
      message: 'an asynchronous cookie store is not supported.',
    }) as Error,
  );
});

test('should not throw Error when only pass synchronous cookie store', () => {
  const jar = new CookieJar();

  expect(() => {
    validateCookieOptions({ jar });
  }).not.toThrowError();
});
