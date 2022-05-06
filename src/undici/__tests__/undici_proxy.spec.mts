import test from 'ava';
import { CookieJar } from 'tough-cookie';
import { ProxyAgent, request } from 'undici';

import { createTestServerWithProxy } from '../../__tests__/helpers.mjs';
import { CookieClient } from '../cookie_client.js';

test.serial('should set cookies to CookieJar from Set-Cookie header', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${proxyPort}`,
  });

  await request(`http://localhost:${port}`, { dispatcher: agent });

  const cookies = await jar.getCookies(`http://localhost:${port}`);
  t.is(cookies.length, 1);
  t.like(cookies[0], { key: 'key', value: 'value' });

  t.plan(2);
});

test.serial('should set cookies to CookieJar from multiple Set-Cookie headers', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', ['key1=value1', 'key2=value2']);
      res.end();
    },
  ]);
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${proxyPort}`,
  });

  await request(`http://localhost:${port}`, { dispatcher: agent });

  const cookies = await jar.getCookies(`http://localhost:${port}`);
  t.is(cookies.length, 2);
  t.like(cookies[0], { key: 'key1', value: 'value1' });
  t.like(cookies[1], { key: 'key2', value: 'value2' });

  t.plan(3);
});

test.serial('should send cookies from CookieJar', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=value');
      res.end();
    },
  ]);
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${proxyPort}`,
  });

  await jar.setCookie('key=value', `http://localhost:${port}`);

  await request(`http://localhost:${port}`, { dispatcher: agent });

  t.plan(1);
});

test.serial('should send cookies from both a request options and CookieJar', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (req, res) => {
      t.is(req.headers['cookie'], 'key1=value1; key2=value2');
      res.end();
    },
  ]);
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${proxyPort}`,
  });

  await jar.setCookie('key1=value1', `http://localhost:${port}`);

  await request(`http://localhost:${port}`, {
    dispatcher: agent,
    headers: { Cookie: 'key2=value2' },
  });

  t.plan(1);
});

test.serial(
  'should send cookies from a request options when the key is duplicated in both a request options and CookieJar',
  async (t) => {
    const jar = new CookieJar();

    const { port, proxyPort } = await createTestServerWithProxy([
      (req, res) => {
        t.is(req.headers['cookie'], 'key=expected');
        res.end();
      },
    ]);
    const agent = new ProxyAgent({
      factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
      uri: `http://localhost:${proxyPort}`,
    });

    await jar.setCookie('key=notexpected', `http://localhost:${port}`);

    await request(`http://localhost:${port}`, {
      dispatcher: agent,
      headers: { Cookie: 'key=expected' },
    });

    t.plan(1);
  },
);

test.serial('should emit error when CookieJar#getCookies throws error.', async (t) => {
  const jar = new CookieJar();
  jar.getCookiesSync = () => {
    throw new Error('Error');
  };

  const { port, proxyPort } = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${proxyPort}`,
  });

  await t.throwsAsync(async () => {
    return request(`http://localhost:${port}`, { dispatcher: agent });
  });

  t.plan(1);
});

test.serial('should emit error when CookieJar#setCookie throws error.', async (t) => {
  const jar = new CookieJar();
  jar.setCookieSync = () => {
    throw new Error('Error');
  };

  const { port, proxyPort } = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const agent = new ProxyAgent({
    factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
    uri: `http://localhost:${proxyPort}`,
  });

  await t.throwsAsync(async () => {
    return request(`http://localhost:${port}`, { dispatcher: agent });
  });

  t.plan(1);
});
