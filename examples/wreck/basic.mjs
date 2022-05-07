import Wreck from '@hapi/wreck';
import { MixedCookieAgent } from 'http-cookie-agent/node:http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await Wreck.get('https://httpbin.org/cookies/set/session/userid', {
  agent: new MixedCookieAgent({ jar }),
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
