import { text } from 'node:stream/consumers';

import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import { expect, test, vi } from 'vitest';

import { createTestServer } from '../../__tests__/helpers';
import { HttpCookieAgent } from '../index';

test('should set cookies to CookieJar from Set-Cookie header', async () => {
  using server = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await fetch(`http://localhost:${server.port}`, {
    agent,
  });

  const actual = await jar.getCookies(`http://localhost:${server.port}`);
  expect(actual).toMatchObject([{ key: 'key', value: 'value' }]);
});

test('should set cookies to CookieJar from multiple Set-Cookie headers', async () => {
  using server = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', ['key1=value1', 'key2=value2']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await fetch(`http://localhost:${server.port}`, {
    agent,
  });

  const actual = await jar.getCookies(`http://localhost:${server.port}`);
  expect(actual).toMatchObject([
    { key: 'key1', value: 'value1' },
    { key: 'key2', value: 'value2' },
  ]);
});

test('should send cookies from CookieJar', async () => {
  using server = await createTestServer([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await jar.setCookie('key=value', `http://localhost:${server.port}`);

  const actual = await fetch(`http://localhost:${server.port}`, {
    agent,
  }).then((res) => res.text());
  expect(actual).toBe('key=value');
});

test('should send cookies from both a request options and CookieJar', async () => {
  using server = await createTestServer([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await jar.setCookie('key1=value1', `http://localhost:${server.port}`);

  const actual = await fetch(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key2=value2' },
  }).then((res) => res.text());
  expect(actual).toBe('key1=value1; key2=value2');
});

test('should send cookies from a request options when the key is duplicated in both a request options and CookieJar', async () => {
  using server = await createTestServer([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await jar.setCookie('key=notexpected', `http://localhost:${server.port}`);

  const actual = await fetch(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key=expected' },
  }).then((res) => res.text());
  expect(actual).toBe('key=expected');
});

test('should send cookies from the first response when redirecting', async () => {
  using server = await createTestServer([
    (_req, res) => {
      res.statusCode = 301;
      res.setHeader('Location', '/redirect');
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  const actual = await fetch(`http://localhost:${server.port}`, {
    agent,
  }).then((res) => res.text());
  expect(actual).toBe('key=value');
});

test('should emit error when CookieJar#getCookies throws error.', async () => {
  using server = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  vi.spyOn(jar, 'getCookiesSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = fetch(`http://localhost:${server.port}`, {
    agent,
  });
  await expect(actual).rejects.toThrowError();
});

test('should emit error when CookieJar#setCookie throws error.', async () => {
  using server = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  vi.spyOn(jar, 'setCookieSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = fetch(`http://localhost:${server.port}`, {
    agent,
  });
  await expect(actual).rejects.toThrowError();
});

test('should send post data when keepalive is enabled', async () => {
  using server = await createTestServer([
    async (req, res) => {
      res.write(
        JSON.stringify({
          cookie: req.headers['cookie'],
          payload: await text(req),
        }),
      );
      res.end();
    },
    async (req, res) => {
      res.write(
        JSON.stringify({
          cookie: req.headers['cookie'],
          payload: await text(req),
        }),
      );
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar }, keepAlive: true });

  await jar.setCookie('key=expected', `http://localhost:${server.port}`);

  const actual = await Promise.all([
    fetch(`http://localhost:${server.port}`, {
      agent,
      body: `payload-01`,
      method: 'POST',
    }).then((res) => res.json()),
    fetch(`http://localhost:${server.port}`, {
      agent,
      body: `payload-02`,
      method: 'POST',
    }).then((res) => res.json()),
  ]);

  expect(actual).toEqual([
    { cookie: 'key=expected', payload: 'payload-01' },
    { cookie: 'key=expected', payload: 'payload-02' },
  ]);
});
