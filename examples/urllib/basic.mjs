import urllib from 'urllib';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent';

const jar = new CookieJar();

await urllib.request('https://httpbin.org/cookies/set/session/userid', {
  agent: new HttpCookieAgent({ jar }),
  httpsAgent: new HttpsCookieAgent({ jar }),
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
