import { CookieAgent } from 'http-cookie-agent/undici';
import { CookieJar } from 'tough-cookie';
import { fetch, setGlobalDispatcher } from 'undici';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } });
setGlobalDispatcher(agent);

await fetch('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
