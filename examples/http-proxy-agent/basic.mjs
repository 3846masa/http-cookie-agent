import http from 'node:http';

import { createCookieAgent } from 'http-cookie-agent/http';
import httpProxyAgent from 'http-proxy-agent';
import { createProxy } from 'proxy';
import { CookieJar } from 'tough-cookie';

// Create reverse proxy for debugging
const proxyServer = createProxy(http.createServer());
proxyServer.listen(9000);

const HttpProxyCookieAgent = createCookieAgent(httpProxyAgent.HttpProxyAgent);

const jar = new CookieJar();
const agent = new HttpProxyCookieAgent('http://127.0.0.1:9000', { cookies: { jar } });

http.get('http://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('http://httpbin.org').then((cookies) => {
    console.log(cookies);
    proxyServer.close();
  });
});
