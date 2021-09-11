import Wreck from '@hapi/wreck';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent';

const jar = new CookieJar();

Wreck.agents.http = new HttpCookieAgent({ jar });
Wreck.agents.https = new HttpsCookieAgent({ jar });
Wreck.agents.httpsAllowUnauthorized = new HttpsCookieAgent({ jar });

await Wreck.get('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
