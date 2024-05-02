/* global Buffer */
import { text } from 'node:stream/consumers';

import Wreck from '@hapi/wreck';
import { expect, jest, test } from '@jest/globals';
import { CookieJar } from 'tough-cookie';

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

  await Wreck.get(`http://localhost:${server.port}`, {
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

  await Wreck.get(`http://localhost:${server.port}`, {
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

  const { payload: actual } = await Wreck.get<Buffer>(`http://localhost:${server.port}`, {
    agent,
    json: false,
  });
  expect(actual.toString('utf-8')).toBe('key=value');
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

  const { payload: actual } = await Wreck.get<Buffer>(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key2=value2' },
    json: false,
  });
  expect(actual.toString('utf-8')).toBe('key1=value1; key2=value2');
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

  const { payload: actual } = await Wreck.get<Buffer>(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key=expected' },
    json: false,
  });
  expect(actual.toString('utf-8')).toBe('key=expected');
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

  const { payload: actual } = await Wreck.get<Buffer>(`http://localhost:${server.port}`, {
    agent,
    json: false,
    redirects: 1,
  });
  expect(actual.toString('utf-8')).toBe('key=value');
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

  jest.spyOn(jar, 'getCookiesSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = Wreck.get(`http://localhost:${server.port}`, {
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

  jest.spyOn(jar, 'setCookieSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = Wreck.get(`http://localhost:${server.port}`, {
    agent,
  });
  await expect(actual).rejects.toThrowError();
});

test('should send post data when keepalive is enabled', async () => {
  using server = await createTestServer([
    async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.write(
        JSON.stringify({
          cookie: req.headers['cookie'],
          payload: await text(req),
        }),
      );
      res.end();
    },
    async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
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
    Wreck.post(`http://localhost:${server.port}`, {
      agent,
      json: 'force',
      payload: `payload-01`,
    }).then((res) => res.payload),
    Wreck.post(`http://localhost:${server.port}`, {
      agent,
      json: 'force',
      payload: `payload-02`,
    }).then((res) => res.payload),
  ]);

  expect(actual).toEqual([
    { cookie: 'key=expected', payload: 'payload-01' },
    { cookie: 'key=expected', payload: 'payload-02' },
  ]);
});
