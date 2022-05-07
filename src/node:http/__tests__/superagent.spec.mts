import test from 'ava';
import superagent from 'superagent';
import { CookieJar } from 'tough-cookie';

import { createTestServer, readStream } from '../../__tests__/helpers.mjs';
import { HttpCookieAgent } from '../index.js';

test('should set cookies to CookieJar from Set-Cookie header', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);

  await superagent.get(`http://localhost:${port}`).agent(agent);

  const cookies = await jar.getCookies(`http://localhost:${port}`);
  t.is(cookies.length, 1);
  t.like(cookies[0], { key: 'key', value: 'value' });

  t.plan(2);
});

test('should set cookies to CookieJar from multiple Set-Cookie headers', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', ['key1=value1', 'key2=value2']);
      res.end();
    },
  ]);

  await superagent.get(`http://localhost:${port}`).agent(agent);

  const cookies = await jar.getCookies(`http://localhost:${port}`);
  t.is(cookies.length, 2);
  t.like(cookies[0], { key: 'key1', value: 'value1' });
  t.like(cookies[1], { key: 'key2', value: 'value2' });

  t.plan(3);
});

test('should send cookies from CookieJar', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=value');
      res.end();
    },
  ]);

  await jar.setCookie('key=value', `http://localhost:${port}`);

  await superagent.get(`http://localhost:${port}`).agent(agent);

  t.plan(1);
});

test('should send cookies from both a request options and CookieJar', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key1=value1; key2=value2');
      res.end();
    },
  ]);

  await jar.setCookie('key1=value1', `http://localhost:${port}`);

  await superagent.get(`http://localhost:${port}`).agent(agent).set('Cookie', 'key2=value2');

  t.plan(1);
});

test('should send cookies from a request options when the key is duplicated in both a request options and CookieJar', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (req, res) => {
      t.is(req.headers['cookie'], 'key=expected');
      res.end();
    },
  ]);

  await jar.setCookie('key=notexpected', `http://localhost:${port}`);

  await superagent.get(`http://localhost:${port}`).agent(agent).set('Cookie', 'key=expected');

  t.plan(1);
});

test('should send cookies from the first response when redirecting', async (t) => {
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (_req, res) => {
      res.statusCode = 301;
      res.setHeader('Location', '/redirect');
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
    (req, res) => {
      t.is(req.headers['cookie'], 'key=value');
      res.end();
    },
  ]);

  await superagent.get(`http://localhost:${port}`).agent(agent);

  t.plan(1);
});

test('should emit error when CookieJar#getCookies throws error.', async (t) => {
  const jar = new CookieJar();
  jar.getCookies = async () => {
    throw new Error('Error');
  };
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);

  await t.throwsAsync(() => {
    return superagent.get(`http://localhost:${port}`).agent(agent);
  });

  t.plan(1);
});

test('should emit error when CookieJar#setCookie throws error.', async (t) => {
  const jar = new CookieJar();
  jar.setCookie = async () => {
    throw new Error('Error');
  };
  const agent = new HttpCookieAgent({ jar });

  const { port } = await createTestServer([
    (_req, res) => {
      res.setHeader('Set-Cookie', 'key=value');
      res.end();
    },
  ]);

  await t.throwsAsync(async () => {
    return superagent.get(`http://localhost:${port}`).agent(agent);
  });

  t.plan(1);
});

test('should send post data when keepalive is enabled', async (t) => {
  const times = 2;

  const jar = new CookieJar();
  const agent = new HttpCookieAgent({ jar, keepAlive: true });

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
    await superagent.post(`http://localhost:${port}`).send(`{ "index": "${idx}" }`).agent(agent);
  }

  t.plan(times * 2);
});
