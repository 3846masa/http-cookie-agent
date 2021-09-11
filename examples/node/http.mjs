import http from 'http';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent } from 'http-cookie-agent';

const jar = new CookieJar();
const agent = new HttpCookieAgent({ jar });

http.get('http://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('http://httpbin.org').then((cookies) => {
    console.log(cookies);
  });
});
