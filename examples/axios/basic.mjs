import axios from 'axios';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await axios.get('https://httpbin.org/cookies/set/session/userid', {
  httpAgent: new HttpCookieAgent({ cookies: { jar } }),
  httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
