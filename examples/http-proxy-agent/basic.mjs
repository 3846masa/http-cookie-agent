import http from 'node:http';

import { createCookieAgent } from 'http-cookie-agent/http';
import httpProxyAgent from 'http-proxy-agent';
import proxy from 'proxy';
import { CookieJar } from 'tough-cookie';

// Create reverse proxy for debugging
const proxyServer = proxy(http.createServer());
proxyServer.listen(9000);

const HttpProxyCookieAgent = createCookieAgent(httpProxyAgent.HttpProxyAgent);

const jar = new CookieJar();
const agent = new HttpProxyCookieAgent({ cookies: { jar }, host: '127.0.0.1', port: 9000 });

http.get('http://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('http://httpbin.org').then((cookies) => {
    console.log(cookies);
    proxyServer.close();
  });
});
