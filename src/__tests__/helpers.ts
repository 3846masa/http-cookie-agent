import http from 'http';
import httpProxy from 'http-proxy';
import { promisify } from 'util';
import { URL } from 'url';
import { Readable } from 'stream';

export async function createTestServer(
  stories: http.RequestListener[],
): Promise<{ server: http.Server; port: number }> {
  const server = http.createServer();

  await promisify(server.listen).apply(server);

  const serverInfo = server.address();
  if (serverInfo === null || typeof serverInfo === 'string') {
    throw new Error('Failed to setup a test server.');
  }

  server.on('request', (req, res) => {
    const listener = stories.shift();
    if (listener !== undefined) {
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
    server,
    port: serverInfo.port,
  };
}

export async function createTestServerWithProxy(
  stories: http.RequestListener[],
): Promise<{ server: http.Server; port: number; proxyPort: number }> {
  const { server, port } = await createTestServer(stories);

  // Create reverse proxy
  const proxy = httpProxy.createProxyServer();
  const proxyServer = http.createServer((req, res) => {
    const url = new URL(req.url!);
    proxy.web(req, res, {
      target: {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
      },
      secure: false,
    });
  });

  await promisify(proxyServer.listen).apply(proxyServer);

  const serverInfo = proxyServer.address();
  if (serverInfo === null || typeof serverInfo === 'string') {
    throw new Error('Failed to setup a test server.');
  }

  server.once('close', () => {
    proxyServer.close();
  });

  return {
    server,
    port,
    proxyPort: serverInfo.port,
  };
}

export async function readStream(stream: Readable): Promise<string> {
  let data = '';
  for await (const chunk of stream) {
    data += chunk;
  }
  return data;
}
