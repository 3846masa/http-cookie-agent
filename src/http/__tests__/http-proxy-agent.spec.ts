import http from 'node:http';
import { text } from 'node:stream/consumers';

import hpa from 'http-proxy-agent';
import { CookieJar } from 'tough-cookie';
import { expect, test, vi } from 'vitest';

import { createTestServerWithProxy } from '../../__tests__/helpers';
import { createCookieAgent } from '../create_cookie_agent';

const HttpProxyCookieAgent = createCookieAgent(hpa.HttpProxyAgent);

export function request(url: string, options: http.RequestOptions, payload?: unknown) {
  const promise = new Promise<string>((resolve, reject) => {
    const req = http.request(url, options);
    req.on('response', (res) => {
      res.on('error', (err) => {
        reject(err);
      });
      res.on('end', () => {
        resolve(data);
      });
      const data = text(res);
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end(payload);
  });

  return promise;
}

test('should set cookies to CookieJar from Set-Cookie header', async () => {
  using server = await createTestServerWithProxy([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpProxyCookieAgent(`http://localhost:${server.proxyPort}`, { cookies: { jar } });

  await request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });

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
  const agent = new HttpProxyCookieAgent(`http://localhost:${server.proxyPort}`, { cookies: { jar } });

  await request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });

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
  const agent = new HttpProxyCookieAgent(`http://localhost:${server.proxyPort}`, { cookies: { jar } });

  await jar.setCookie('key=value', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });
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
  const agent = new HttpProxyCookieAgent(`http://localhost:${server.proxyPort}`, { cookies: { jar } });

  await jar.setCookie('key1=value1', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key2=value2' },
    method: 'GET',
  });
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
  const agent = new HttpProxyCookieAgent(`http://localhost:${server.proxyPort}`, { cookies: { jar } });

  await jar.setCookie('key=notexpected', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key=expected' },
    method: 'GET',
  });
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
  const agent = new HttpProxyCookieAgent(`http://localhost:${server.proxyPort}`, { cookies: { jar } });

  vi.spyOn(jar, 'getCookiesSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });
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
  const agent = new HttpProxyCookieAgent(`http://localhost:${server.proxyPort}`, { cookies: { jar } });

  vi.spyOn(jar, 'setCookieSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });
  await expect(actual).rejects.toThrowError();
});
