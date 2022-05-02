import got from 'got';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

const client = got.extend({
  agent: {
    http: new HttpCookieAgent({ jar }),
    https: new HttpsCookieAgent({ jar }),
  },
});

await client('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
