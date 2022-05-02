import { MixedCookieAgent } from 'http-cookie-agent';
import needle from 'needle';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await needle('get', 'https://httpbin.org/cookies/set/session/userid', {
  agent: new MixedCookieAgent({ jar }),
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
