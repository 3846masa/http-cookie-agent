import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';
import { CookieJar } from 'tough-cookie';
import urllib from 'urllib';

const jar = new CookieJar();

const client = urllib.create({
  agent: new HttpCookieAgent({ jar }),
  httpsAgent: new HttpsCookieAgent({ jar }),
});

await client.request('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
