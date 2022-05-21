import http from 'node:http';

import { CookieClient } from 'http-cookie-agent/undici';
import httpProxy from 'http-proxy';
import { CookieJar } from 'tough-cookie';
import { fetch, ProxyAgent } from 'undici';

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

const jar = new CookieJar();
const agent = new ProxyAgent({
  factory: (origin, opts) => new CookieClient(origin, { ...opts, cookies: { jar } }),
  uri: 'http://127.0.0.1:9000',
});

await fetch('https://httpbin.org/cookies/set/session/userid', { dispatcher: agent });

const cookies = await jar.getCookies('https://httpbin.org');
console.log(cookies);

proxyServer.close();
