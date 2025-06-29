import http from 'node:http';
import { text } from 'node:stream/consumers';

import { CookieJar } from 'tough-cookie';
import { expect, test, vi } from 'vitest';

import { createTestServer } from '../../__tests__/helpers';
import { HttpCookieAgent } from '../index';

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
  using server = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
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
  using server = await createTestServer([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await jar.setCookie('key=value', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });
  expect(actual).toBe('key=value');
});

test('should send cookies from CookieJar when value is url-encoded', async () => {
  using server = await createTestServer([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  await jar.setCookie('key=hello%20world', `http://localhost:${server.port}`);

  const actual = await request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });
  expect(actual).toBe('key=hello%20world');
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

  const actual = await request(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key2=value2' },
    method: 'GET',
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

  const actual = await request(`http://localhost:${server.port}`, {
    agent,
    headers: { Cookie: 'key=expected' },
    method: 'GET',
  });
  expect(actual).toBe('key=expected');
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

  const actual = request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
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

  const actual = request(`http://localhost:${server.port}`, {
    agent,
    method: 'GET',
  });
  await expect(actual).rejects.toThrowError();
});

test('should send cookies even when target is same host but different port', async () => {
  using firstServer = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=expected');
      res.end();
    },
  ]);
  using secondServer = await createTestServer([
    (req, res) => {
      res.write(req.headers['cookie']);
      res.end();
    },
  ]);
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { jar } });

  {
    await request(`http://localhost:${firstServer.port}`, {
      agent,
      method: 'GET',
    });
  }
  {
    const actual = await request(`http://localhost:${secondServer.port}`, {
      agent,
      method: 'GET',
    });
    expect(actual).toBe('key=expected');
  }
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
    request(
      `http://localhost:${server.port}`,
      {
        agent,
        method: 'POST',
      },
      `payload-01`,
    ).then((res) => JSON.parse(res) as object),
    request(
      `http://localhost:${server.port}`,
      {
        agent,
        method: 'POST',
      },
      `payload-02`,
    ).then((res) => JSON.parse(res) as object),
  ]);

  expect(actual).toEqual([
    { cookie: 'key=expected', payload: 'payload-01' },
    { cookie: 'key=expected', payload: 'payload-02' },
  ]);
});
