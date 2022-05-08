import { MixedCookieAgent } from 'http-cookie-agent/http';
import superagent from 'superagent';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const mixedAgent = new MixedCookieAgent({ cookies: { jar } });

await superagent.get('https://httpbin.org/cookies/set/session/userid').agent(mixedAgent);

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
