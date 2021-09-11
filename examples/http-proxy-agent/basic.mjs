import http from 'http';
import { CookieJar } from 'tough-cookie';
import { createCookieAgent } from 'http-cookie-agent';
import httpProxy from 'http-proxy';
import httpProxyAgent from 'http-proxy-agent';

// Create reverse proxy for debugging
const proxy = httpProxy.createServer();
const proxyServer = http.createServer((req, res) => {
  const url = new URL(req.url);
  proxy.web(req, res, {
    target: {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
    },
    secure: false,
  });
});
proxyServer.listen(9000);

const HttpProxyCookieAgent = createCookieAgent(httpProxyAgent.HttpProxyAgent);

const jar = new CookieJar();
const agent = new HttpProxyCookieAgent({ jar, host: '127.0.0.1', port: 9000 });

http.get('http://httpbin.org/cookies/set/session/userid', { agent }, (_res) => {
  jar.getCookies('http://httpbin.org').then((cookies) => {
    console.log(cookies);
    proxyServer.close();
  });
});
