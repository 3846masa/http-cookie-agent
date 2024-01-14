import http from 'node:http';
import { promisify } from 'node:util';

import { createProxy } from 'proxy';

export async function createTestServer(
  stories: http.RequestListener[],
): Promise<{ [Symbol.dispose]: () => void; port: number }> {
  const server = http.createServer();

  await promisify(server.listen).apply(server);

  const serverInfo = server.address();
  if (serverInfo == null || typeof serverInfo === 'string') {
    throw new Error('Failed to setup a test server.');
  }

  server.on('request', (req, res) => {
    const listener = stories.shift();
    listener?.(req, res);
  });

  server.on('clientError', (err, socket) => {
    console.error(err);
    socket.end();
  });

  return {
    [Symbol.dispose]: () => {
      server.close();
    },
    port: serverInfo.port,
  };
}

async function createProxyServer(): Promise<{ [Symbol.dispose]: () => void; port: number }> {
  // Create reverse proxy
  const server = createProxy(http.createServer());

  await promisify(server.listen).apply(server);

  const serverInfo = server.address();
  if (serverInfo == null || typeof serverInfo === 'string') {
    throw new Error('Failed to setup a test server.');
  }

  return {
    [Symbol.dispose]: () => {
      server.close();
    },
    port: serverInfo.port,
  };
}

export async function createTestServerWithProxy(
  stories: http.RequestListener[],
): Promise<{ [Symbol.dispose]: () => void; port: number; proxyPort: number }> {
  const server = await createTestServer(stories);
  const proxyServer = await createProxyServer();

  return {
    [Symbol.dispose]: () => {
      server[Symbol.dispose]();
      proxyServer[Symbol.dispose]();
    },
    port: server.port,
    proxyPort: proxyServer.port,
  };
}
