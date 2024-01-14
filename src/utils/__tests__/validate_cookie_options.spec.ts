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

test('should throw Error when async_UNSTABLE is true but deasync is not installed', () => {
  const jar = new CookieJar();

  const resolver = () => {
    throw new Error();
  };

  expect(() => {
    validateCookieOptions({ async_UNSTABLE: true, jar }, resolver);
  }).toThrowError({
    message: 'you should install deasync library when cookies.async_UNSTABLE is true.',
  });
});

test('should throw Error when cookie store is asynchronous but async_UNSTABLE is not set', () => {
  const jar = new CookieJar();
  jar.store.synchronous = false;

  expect(() => {
    validateCookieOptions({ jar });
  }).toThrowError({
    message: 'you should set cookies.async_UNSTABLE to true for using the asynchronous cookie store.',
  });
});

test('should not throw Error when only pass synchronous cookie store', () => {
  const jar = new CookieJar();

  expect(() => {
    validateCookieOptions({ jar });
  }).not.toThrowError();
});

test('should not throw Error when cookie store is asynchronous and async_UNSTABLE is true', () => {
  const jar = new CookieJar();

  expect(() => {
    validateCookieOptions({ async_UNSTABLE: true, jar });
  }).not.toThrowError();
});
