import https from 'node:https';

import { HttpsCookieAgent } from 'http-cookie-agent/node:http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const agent = new HttpsCookieAgent({ cookies: { jar } });

https.get('https://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('https://httpbin.org').then((cookies) => {
    console.log(cookies);
  });
});
