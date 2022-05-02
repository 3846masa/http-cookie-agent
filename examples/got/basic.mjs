import got from 'got';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await got('https://httpbin.org/cookies/set/session/userid', {
  agent: {
    http: new HttpCookieAgent({ jar }),
    https: new HttpsCookieAgent({ jar }),
  },
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
