import { CookieAgent } from 'http-cookie-agent/undici';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } });

await fetch('https://httpbin.org/cookies/set/session/userid', { dispatcher: agent });

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
