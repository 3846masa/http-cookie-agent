import { MixedCookieAgent } from 'http-cookie-agent/node:http';
import phin from 'phin';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await phin({
  core: {
    agent: new MixedCookieAgent({ cookies: { jar } }),
  },
  url: 'https://httpbin.org/cookies/set/session/userid',
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
