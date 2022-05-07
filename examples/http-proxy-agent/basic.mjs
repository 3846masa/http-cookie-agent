import http from 'node:http';

import { createCookieAgent } from 'http-cookie-agent/node:http';
import httpProxy from 'http-proxy';
import httpProxyAgent from 'http-proxy-agent';
import { CookieJar } from 'tough-cookie';

// Create reverse proxy for debugging
const proxy = httpProxy.createServer();
const proxyServer = http.createServer((req, res) => {
  const url = new URL(req.url);
  proxy.web(req, res, {
    secure: false,
    target: {
      hostname: url.hostname,
      port: url.port,
      protocol: url.protocol,
    },
  });
});
proxyServer.listen(9000);

const HttpProxyCookieAgent = createCookieAgent(httpProxyAgent.HttpProxyAgent);

const jar = new CookieJar();
const agent = new HttpProxyCookieAgent({ host: '127.0.0.1', jar, port: 9000 });

http.get('http://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('http://httpbin.org').then((cookies) => {
    console.log(cookies);
    proxyServer.close();
  });
});
