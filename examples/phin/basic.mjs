import phin from 'phin';
import { CookieJar } from 'tough-cookie';
import { MixedCookieAgent } from 'http-cookie-agent';

const jar = new CookieJar();

await phin({
  url: 'https://httpbin.org/cookies/set/session/userid',
  core: {
    agent: new MixedCookieAgent({ jar }),
  },
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
