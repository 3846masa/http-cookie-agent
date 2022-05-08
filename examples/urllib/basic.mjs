import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';
import urllib from 'urllib';

const jar = new CookieJar();

await urllib.request('https://httpbin.org/cookies/set/session/userid', {
  agent: new HttpCookieAgent({ cookies: { jar } }),
  httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
