import got from 'got';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();

await got('https://httpbin.org/cookies/set/session/userid', {
  cookieJar: jar,
});

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
