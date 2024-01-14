import { expect, jest, test } from '@jest/globals';
import { CookieJar } from 'tough-cookie';
import { ProxyAgent, request } from 'undici';

import { createTestServerWithProxy } from '../../__tests__/helpers';
import { CookieClient } from '../cookie_client';

test('should set cookies to CookieJar from Set-Cookie header', async () => {
  using server = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${server.proxyPort}`,
  });

  await request(`http://localhost:${server.port}`, { dispatcher: agent });

  const actual = await jar.getCookies(`http://localhost:${server.port}`);
  expect(actual).toMatchObject([{ key: 'key', value: 'value' }]);
});

test('should set cookies to CookieJar from multiple Set-Cookie headers', async () => {
  using server = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', ['key1=value1', 'key2=value2']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${server.proxyPort}`,
  });

  await request(`http://localhost:${server.port}`, { dispatcher: agent });

  const actual = await jar.getCookies(`http://localhost:${server.port}`);
  expect(actual).toMatchObject([
    { key: 'key1', value: 'value1' },
    { key: 'key2', value: 'value2' },
  ]);
});

test('should send cookies from CookieJar', async () => {
  using server = await createTestServerWithProxy([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${server.proxyPort}`,
  });

  await jar.setCookie('key=value', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, { dispatcher: agent }).then((res) => res.body.text());
  expect(actual).toBe('key=value');
});

test('should send cookies from both a request options and CookieJar', async () => {
  using server = await createTestServerWithProxy([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${server.proxyPort}`,
  });

  await jar.setCookie('key1=value1', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, {
    dispatcher: agent,
    headers: { Cookie: 'key2=value2' },
  }).then((res) => res.body.text());
  expect(actual).toBe('key1=value1; key2=value2');
});

test('should send cookies from a request options when the key is duplicated in both a request options and CookieJar', async () => {
  using server = await createTestServerWithProxy([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${server.proxyPort}`,
  });

  await jar.setCookie('key=notexpected', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, {
    dispatcher: agent,
    headers: { Cookie: 'key=expected' },
  }).then((res) => res.body.text());
  expect(actual).toBe('key=expected');
});

test('should emit error when CookieJar#getCookies throws error.', async () => {
  using server = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${server.proxyPort}`,
  });

  jest.spyOn(jar, 'getCookiesSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = request(`http://localhost:${server.port}`, { dispatcher: agent });
  await expect(actual).rejects.toThrowError();
});

test('should emit error when CookieJar#setCookie throws error.', async () => {
  using server = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${server.proxyPort}`,
  });

  jest.spyOn(jar, 'setCookieSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = request(`http://localhost:${server.port}`, { dispatcher: agent });
  await expect(actual).rejects.toThrowError();
});
