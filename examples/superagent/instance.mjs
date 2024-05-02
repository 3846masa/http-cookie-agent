import { MixedCookieAgent } from 'http-cookie-agent/http';
import superagent from 'superagent';
import { CookieJar } from 'tough-cookie';

const jar = new CookieJar();
const mixedAgent = new MixedCookieAgent({ cookies: { jar } });

const client = superagent.agent().use(
  /** @param {import('superagent').Request} req */
  (req) => req.agent(mixedAgent),
);

await client.get('https://httpbin.org/cookies/set/session/userid');

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);
