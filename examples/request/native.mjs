import request from 'request';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

request.get('https://httpbin.org/cookies/set/session/userid', { jar }, (_err, _res) => {
  jar.getCookies('https://httpbin.org').then((cookies) => {
    console.log(cookies);
  });
});
