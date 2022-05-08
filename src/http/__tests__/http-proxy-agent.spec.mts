import http from 'node:http';

import test from 'ava';
import hpa from 'http-proxy-agent';
import { CookieJar } from 'tough-cookie';

import { createTestServerWithProxy } from '../../__tests__/helpers.mjs';
import { createCookieAgent } from '../create_cookie_agent.js';

const HttpProxyCookieAgent = createCookieAgent(hpa.HttpProxyAgent);

export function request(url: string, options: http.RequestOptions, payload?: unknown) {
  const promise = new Promise<http.IncomingMessage>((resolve, reject) => {
    const req = http.request(url, options);
    req.on('response', (res) => {
      res.on('error', (err) => reject(err));
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      res.on('data', () => {});
      res.on('end', () => resolve(res));
    });
    req.on('error', (err) => reject(err));
    req.end(payload);
  });

  return promise;
}

test('should set cookies to CookieJar from Set-Cookie header', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: 'localhost', port: proxyPort });

  await request(`http://localhost:${port}`, {
    agent,
    method: 'GET',
  });

  const cookies = await jar.getCookies(`http://localhost:${port}`);
  t.is(cookies.length, 1);
  t.like(cookies[0], { key: 'key', value: 'value' });

  t.plan(2);
});

test('should set cookies to CookieJar from multiple Set-Cookie headers', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', ['key1=value1', 'key2=value2']);
      res.end();
    },
  ]);
  const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: 'localhost', port: proxyPort });

  await request(`http://localhost:${port}`, {
    agent,
    method: 'GET',
  });

  const cookies = await jar.getCookies(`http://localhost:${port}`);
  t.is(cookies.length, 2);
  t.like(cookies[0], { key: 'key1', value: 'value1' });
  t.like(cookies[1], { key: 'key2', value: 'value2' });

  t.plan(3);
});

test('should send cookies from CookieJar', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=value');
      res.end();
    },
  ]);
  const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: 'localhost', port: proxyPort });

  await jar.setCookie('key=value', `http://localhost:${port}`);

  await request(`http://localhost:${port}`, {
    agent,
    method: 'GET',
  });

  t.plan(1);
});

test('should send cookies from both a request options and CookieJar', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (req, res) => {
      t.is(req.headers['cookie'], 'key1=value1; key2=value2');
      res.end();
    },
  ]);
  const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: 'localhost', port: proxyPort });

  await jar.setCookie('key1=value1', `http://localhost:${port}`);

  await request(`http://localhost:${port}`, {
    agent,
    headers: { Cookie: 'key2=value2' },
    method: 'GET',
  });

  t.plan(1);
});

test('should send cookies from a request options when the key is duplicated in both a request options and CookieJar', async (t) => {
  const jar = new CookieJar();

  const { port, proxyPort } = await createTestServerWithProxy([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=expected');
      res.end();
    },
  ]);
  const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: 'localhost', port: proxyPort });

  await jar.setCookie('key=notexpected', `http://localhost:${port}`);

  await request(`http://localhost:${port}`, {
    agent,
    headers: { Cookie: 'key=expected' },
    method: 'GET',
  });

  t.plan(1);
});

test('should emit error when CookieJar#getCookies throws error.', async (t) => {
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
  const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: 'localhost', port: proxyPort });

  await t.throwsAsync(() => {
    return request(`http://localhost:${port}`, {
      agent,
      method: 'GET',
    });
  });

  t.plan(1);
});

test('should emit error when CookieJar#setCookie throws error.', async (t) => {
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
  const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: 'localhost', port: proxyPort });

  await t.throwsAsync(() => {
    return request(`http://localhost:${port}`, {
      agent,
      method: 'GET',
    });
  });

  t.plan(1);
});
