import http from 'node:http';

import { cookie } from 'http-cookie-agent/undici';
import { createProxy } from 'proxy';
import { CookieJar } from 'tough-cookie';
import { fetch, ProxyAgent } from 'undici';

// Create reverse proxy for debugging
const proxyServer = createProxy(http.createServer());
proxyServer.listen(9000);

const jar = new CookieJar();
const agent = new ProxyAgent({
  uri: 'http://127.0.0.1:9000',
}).compose(cookie({ jar }));

await fetch('https://httpbin.org/cookies/set/session/userid', { dispatcher: agent });

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);

proxyServer.close();
