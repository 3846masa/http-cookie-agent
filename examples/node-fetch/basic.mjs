import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';
import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

const httpAgent = new HttpCookieAgent({ jar });
const httpsAgent = new HttpsCookieAgent({ jar });

await fetch('https://httpbin.org/cookies/set/session/userid', {
  agent: ({ protocol }) => {
    return protocol === 'https:' ? httpsAgent : httpAgent;
  },
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
