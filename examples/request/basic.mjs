import { MixedCookieAgent } from 'http-cookie-agent/node:http';
import request from 'request';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

request.get(
  'https://httpbin.org/cookies/set/session/userid',
  { agent: new MixedCookieAgent({ jar }) },
  (_err, _res) => {
    jar.getCookies('https://httpbin.org').then((cookies) => {
      console.log(cookies);
    });
  },
);
