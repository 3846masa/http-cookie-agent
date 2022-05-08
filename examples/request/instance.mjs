import { MixedCookieAgent } from 'http-cookie-agent/http';
import request from 'request';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

const client = request.defaults({
  agent: new MixedCookieAgent({ cookies: { jar } }),
});

client.get('https://httpbin.org/cookies/set/session/userid', (_err, _res) => {
  jar.getCookies('https://httpbin.org').then((cookies) => {
    console.log(cookies);
  });
});
