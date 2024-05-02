import { text } from 'node:stream/consumers';

import { expect, jest, test } from '@jest/globals';
import axios from 'axios';
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

  await axios.get(`http://localhost:${server.port}`, {
    httpAgent: agent,
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

  await axios.get(`http://localhost:${server.port}`, {
    httpAgent: agent,
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

  const { data: actual } = await axios.get<string>(`http://localhost:${server.port}`, {
    httpAgent: agent,
    responseType: 'text',
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

  const { data: actual } = await axios.get<string>(`http://localhost:${server.port}`, {
    headers: { Cookie: 'key2=value2' },
    httpAgent: agent,
    responseType: 'text',
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

  const { data: actual } = await axios.get<string>(`http://localhost:${server.port}`, {
    headers: { Cookie: 'key=expected' },
    httpAgent: agent,
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

  const { data: actual } = await axios.get<string>(`http://localhost:${server.port}`, {
    httpAgent: agent,
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

  const actual = axios.get(`http://localhost:${server.port}`, {
    httpAgent: agent,
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

  const actual = axios.get(`http://localhost:${server.port}`, {
    httpAgent: agent,
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
    axios
      .post<string>(`http://localhost:${server.port}`, `payload-01`, {
        httpAgent: agent,
        responseType: 'json',
      })
      .then((res) => res.data),
    axios
      .post<string>(`http://localhost:${server.port}`, `payload-02`, {
        httpAgent: agent,
        responseType: 'json',
      })
      .then((res) => res.data),
  ]);

  expect(actual).toEqual([
    { cookie: 'key=expected', payload: 'payload-01' },
    { cookie: 'key=expected', payload: 'payload-02' },
  ]);
});
