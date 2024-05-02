import { MixedCookieAgent } from 'http-cookie-agent/http';
import request from 'request';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

request.get(
  'https://httpbin.org/cookies/set/session/userid',
  { agent: new MixedCookieAgent({ cookies: { jar } }) },
  (_err, _res) => {
    void jar.getCookies('https://httpbin.org').then((cookies) => {
      console.log(cookies);
    });
  },
);
