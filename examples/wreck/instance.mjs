import Wreck from '@hapi/wreck';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

const client = Wreck.defaults({
  agents: {
    http: new HttpCookieAgent({ jar }),
    https: new HttpsCookieAgent({ jar }),
    httpsAllowUnauthorized: new HttpsCookieAgent({ jar }),
  },
});

await client.get('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
