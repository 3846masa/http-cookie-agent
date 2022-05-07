import http from 'node:http';

import test from 'ava';
import { CookieJar } from 'tough-cookie';

import { createTestServer, readStream } from '../../__tests__/helpers.mjs';
import { HttpCookieAgent } from '../index.js';

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
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);

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
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', ['key1=value1', 'key2=value2']);
      res.end();
    },
  ]);

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
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=value');
      res.end();
    },
  ]);

  await jar.setCookie('key=value', `http://localhost:${port}`);

  await request(`http://localhost:${port}`, {
    agent,
    method: 'GET',
  });

  t.plan(1);
});

test('should send cookies from CookieJar when value is url-encoded', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=hello%20world');
      res.end();
    },
  ]);

  await jar.setCookie('key=hello%20world', `http://localhost:${port}`);

  await request(`http://localhost:${port}`, {
    agent,
    method: 'GET',
  });

  t.plan(1);
});

test('should send cookies from both a request options and CookieJar', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key1=value1; key2=value2');
      res.end();
    },
  ]);

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
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=expected');
      res.end();
    },
  ]);

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
  // @ts-expect-error ...
  jar.getCookies = (...args) => {
    const cb = args.at(-1);
    if (typeof cb === 'function') {
      cb(new Error('Error'));
    } else {
      return Promise.reject(new Error('Error'));
    }
  };
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);

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
  // @ts-expect-error ...
  jar.setCookie = (...args) => {
    const cb = args.at(-1);
    if (typeof cb === 'function') {
      cb(new Error('Error'));
    } else {
      return Promise.reject(new Error('Error'));
    }
  };
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);

  await t.throwsAsync(() => {
    return request(`http://localhost:${port}`, {
      agent,
      method: 'GET',
    });
  });

  t.plan(1);
});

test('should send cookies even when target is same host but different port', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar } });

  const { port: firstServerPort } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=expected');
      res.end();
    },
  ]);

  const { port: secondServerPort } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=expected');
      res.end();
    },
  ]);

  {
    await request(`http://localhost:${firstServerPort}`, {
      agent,
      method: 'GET',
    });
  }
  {
    await request(`http://localhost:${secondServerPort}`, {
      agent,
      method: 'GET',
    });
  }

  t.plan(1);
});

test('should send post data when keepalive is enabled', async (t) => {
  const times = 2;

  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ cookies: { async_UNSTABLE: true, jar }, keepAlive: true });

  const { port } = await createTestServer(
    Array.from({ length: times }, (_, idx) => {
      return async (req, res) => {
        t.is(await readStream(req), `{ "index": "${idx}" }`);
        t.is(req.headers['cookie'], 'key=expected');
        res.end();
      };
    }),
  );

  await jar.setCookie('key=expected', `http://localhost:${port}`);

  for (let idx = 0; idx < times; idx++) {
    await request(
      `http://localhost:${port}`,
      {
        agent,
        method: 'POST',
      },
      `{ "index": "${idx}" }`,
    );
  }

  t.plan(times * 2);
});
