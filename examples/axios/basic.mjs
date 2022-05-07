import axios from 'axios';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await axios.get('https://httpbin.org/cookies/set/session/userid', {
  httpAgent: new HttpCookieAgent({ jar }),
  httpsAgent: new HttpsCookieAgent({ jar }),
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
