import Wreck from '@hapi/wreck';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

Wreck.agents.http = new HttpCookieAgent({ cookies: { jar } });
Wreck.agents.https = new HttpsCookieAgent({ cookies: { jar } });
Wreck.agents.httpsAllowUnauthorized = new HttpsCookieAgent({ cookies: { jar } });

await Wreck.get('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
