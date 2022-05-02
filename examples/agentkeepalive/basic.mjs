import https from 'node:https';

import { HttpsAgent as KeepAliveAgent } from 'agentkeepalive';
import { createCookieAgent } from 'http-cookie-agent';
import { CookieJar } from 'tough-cookie';

const KeepAliveCookieAgent = createCookieAgent(KeepAliveAgent);

const jar = new CookieJar();
const agent = new KeepAliveCookieAgent({ jar });

https.get('https://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('https://httpbin.org').then((cookies) => {
    console.log(cookies);
    agent.destroy();
  });
});
