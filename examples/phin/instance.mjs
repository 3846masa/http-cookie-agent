import { MixedCookieAgent } from 'http-cookie-agent';
import phin from 'phin';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

const client = phin.defaults({
  core: {
    agent: new MixedCookieAgent({ jar }),
  },
});

await client('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
