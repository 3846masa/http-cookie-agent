import test from 'ava';
import { CookieJar } from 'tough-cookie';
import { errors } from 'undici';

import { validateCookieOptions } from '../validate_cookie_options.js';

test('should throw Error when jar is not set', (t) => {
  t.throws(
    () => {
      validateCookieOptions({});
    },
    {
      instanceOf: errors.InvalidArgumentError,
      message: 'invalid cookies.jar object',
    },
  );
});

test('should throw Error when jar is not CookieJar', (t) => {
  t.throws(
    () => {
      validateCookieOptions({ jar: {} });
    },
    {
      instanceOf: errors.InvalidArgumentError,
      message: 'invalid cookies.jar object',
    },
  );
});

test('should throw Error when async_UNSTABLE is true but deasync is not installed', (t) => {
  const jar = new CookieJar();

  t.throws(
    () => {
      const resolver = () => {
        throw new Error();
      };
      validateCookieOptions({ async_UNSTABLE: true, jar }, resolver);
    },
    {
      instanceOf: errors.InformationalError,
      message: 'you should install deasync library when cookies.async_UNSTABLE is true.',
    },
  );
});

test('should throw Error when cookie store is asynchronous but async_UNSTABLE is not set', (t) => {
  const jar = new CookieJar();
  jar.store.synchronous = false;

  t.throws(
    () => {
      validateCookieOptions({ jar });
    },
    {
      instanceOf: errors.InvalidArgumentError,
      message: 'you should set cookies.async_UNSTABLE to true for using the asynchronous cookie store.',
    },
  );
});

test('should not throw Error when only pass synchronous cookie store', (t) => {
  const jar = new CookieJar();

  t.notThrows(() => {
    validateCookieOptions({ jar });
  });
});

test('should not throw Error when cookie store is asynchronous and async_UNSTABLE is true', (t) => {
  const jar = new CookieJar();

  t.notThrows(() => {
    validateCookieOptions({ async_UNSTABLE: true, jar });
  });
});
