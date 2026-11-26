import { CookieJar } from 'tough-cookie';
import { expect, test } from 'vitest';

import { createCookieHeaderValue } from '../create_cookie_header_value';

test('should send all jar cookies sharing a name, most specific path first', () => {
  const jar = new CookieJar();
  jar.setCookieSync('r=root; Path=/', 'http://example.com/');
  jar.setCookieSync('r=scoped; Path=/login', 'http://example.com/login');

  expect(
    createCookieHeaderValue({ cookieOptions: { jar }, passedValues: [], requestUrl: 'http://example.com/login/step' }),
  ).toBe('r=scoped; r=root');
});

test('should let a passed cookie replace every jar cookie with the same name', () => {
  const jar = new CookieJar();
  jar.setCookieSync('r=root; Path=/', 'http://example.com/');
  jar.setCookieSync('r=scoped; Path=/login', 'http://example.com/login');
  jar.setCookieSync('k=jar', 'http://example.com/');

  expect(
    createCookieHeaderValue({
      cookieOptions: { jar },
      passedValues: ['r=manual; x=1', null],
      requestUrl: 'http://example.com/login/step',
    }),
  ).toBe('k=jar; r=manual; x=1');
});
