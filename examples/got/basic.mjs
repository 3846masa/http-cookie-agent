import got from 'got';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await got('https://httpbin.org/cookies/set/session/userid', {
  agent: {
    http: new HttpCookieAgent({ cookies: { jar } }),
    https: new HttpsCookieAgent({ cookies: { jar } }),
  },
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
