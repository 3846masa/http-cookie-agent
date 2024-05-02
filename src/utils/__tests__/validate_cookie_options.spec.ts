import { expect, test } from '@jest/globals';
import { CookieJar } from 'tough-cookie';

import { validateCookieOptions } from '../validate_cookie_options';

test('should throw Error when jar is not set', () => {
  expect(() => {
    validateCookieOptions({});
  }).toThrowError({
    message: 'invalid cookies.jar',
  });
});

test('should throw Error when cookie store is asynchronous', () => {
  const jar = new CookieJar();
  jar.store.synchronous = false;

  expect(() => {
    validateCookieOptions({ jar });
  }).toThrowError({
    message: 'an asynchronous cookie store is not supported.',
  });
});

test('should not throw Error when only pass synchronous cookie store', () => {
  const jar = new CookieJar();

  expect(() => {
    validateCookieOptions({ jar });
  }).not.toThrowError();
});
