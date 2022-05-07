import axios from 'axios';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

Object.assign(axios.defaults, {
  httpAgent: new HttpCookieAgent({ cookies: { jar } }),
  httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
});

await axios.get('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
