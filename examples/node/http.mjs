import http from 'node:http';

import { HttpCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const agent = new HttpCookieAgent({ cookies: { jar } });

http.get('http://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('http://httpbin.org').then((cookies) => {
    console.log(cookies);
  });
});
