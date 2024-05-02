import { CookieAgent } from 'http-cookie-agent/undici';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } });
// @ts-expect-error -- This is escape hatch. See https://github.com/nodejs/node/issues/43187#issuecomment-1134634174
globalThis[Symbol.for('undici.globalDispatcher.1')] = agent;

await fetch('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
