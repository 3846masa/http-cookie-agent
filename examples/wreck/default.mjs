import Wreck from '@hapi/wreck';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

Object.assign(Wreck.agents, {
  http: new HttpCookieAgent({ cookies: { jar } }),
  https: new HttpsCookieAgent({ cookies: { jar } }),
  httpsAllowUnauthorized: new HttpsCookieAgent({ cookies: { jar } }),
});

await Wreck.get('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
