import http from 'node:http';
import type { Readable } from 'node:stream';
import { promisify } from 'node:util';

import proxy from 'proxy';

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
  const proxyServer = proxy(http.createServer());

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
