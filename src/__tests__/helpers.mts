import http from 'node:http';
import type { Readable } from 'node:stream';
import { URL } from 'node:url';
import { promisify } from 'node:util';

import httpProxy from 'http-proxy';

export async function createTestServer(
  stories: http.RequestListener[],
): Promise<{ port: number; server: http.Server }> {
  const server = http.createServer();

  await promisify(server.listen).apply(server);

  const serverInfo = server.address();
  if (serverInfo == null || typeof serverInfo === 'string') {
    throw new Error('Failed to setup a test server.');
  }

  server.on('request', (req, res) => {
    const listener = stories.shift();
    if (listener != null) {
      listener(req, res);
    }
    if (stories.length === 0) {
      server.close();
    }
  });

  server.on('clientError', (err, socket) => {
    console.error(err);
    socket.end();
  });

  return {
    port: serverInfo.port,
    server,
  };
}

export async function createTestServerWithProxy(
  stories: http.RequestListener[],
): Promise<{ port: number; proxyPort: number; server: http.Server }> {
  const { port, server } = await createTestServer(stories);

  // Create reverse proxy
  const proxy = httpProxy.createProxyServer();
  const proxyServer = http.createServer((req, res) => {
    const url = new URL(req.url ?? '');
    proxy.web(req, res, {
      secure: false,
      target: {
        hostname: url.hostname,
        port: url.port,
        protocol: url.protocol,
      },
    });
  });

  await promisify(proxyServer.listen).apply(proxyServer);

  const serverInfo = proxyServer.address();
  if (serverInfo == null || typeof serverInfo === 'string') {
    throw new Error('Failed to setup a test server.');
  }

  server.once('close', () => {
    proxyServer.close();
  });

  return {
    port,
    proxyPort: serverInfo.port,
    server,
  };
}

export async function readStream(stream: Readable): Promise<string> {
  let data = '';
  for await (const chunk of stream) {
    data += chunk;
  }
  return data;
}
