import { text } from 'node:stream/consumers';

import { expect, jest, test } from '@jest/globals';
import phin from 'phin';
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

  await phin({
    core: { agent },
    url: `http://localhost:${server.port}`,
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

  await phin({
    core: { agent },
    url: `http://localhost:${server.port}`,
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

  const { body: actual } = await phin({
    core: { agent },
    parse: 'string',
    url: `http://localhost:${server.port}`,
  });
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

  const { body: actual } = await phin({
    core: { agent },
    headers: { Cookie: 'key2=value2' },
    parse: 'string',
    url: `http://localhost:${server.port}`,
  });

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

  const { body: actual } = await phin({
    core: { agent },
    headers: { Cookie: 'key=expected' },
    parse: 'string',
    url: `http://localhost:${server.port}`,
  });
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

  const { body: actual } = await phin({
    core: { agent },
    followRedirects: true,
    parse: 'string',
    url: `http://localhost:${server.port}`,
  });
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

  jest.spyOn(jar, 'getCookiesSync').mockImplementation(() => {
    throw new Error('Error');
  });

  const actual = phin({
    core: { agent },
    url: `http://localhost:${server.port}`,
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

  const actual = phin({
    core: { agent },
    url: `http://localhost:${server.port}`,
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
    phin({
      core: { agent },
      data: `payload-01`,
      method: 'POST',
      parse: 'json',
      url: `http://localhost:${server.port}`,
    }).then((res) => res.body),
    phin({
      core: { agent },
      data: `payload-02`,
      method: 'POST',
      parse: 'json',
      url: `http://localhost:${server.port}`,
    }).then((res) => res.body),
  ]);

  expect(actual).toEqual([
    { cookie: 'key=expected', payload: 'payload-01' },
    { cookie: 'key=expected', payload: 'payload-02' },
  ]);
});
