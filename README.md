# HTTP Cookie Agent

![HTTP Cookie Agent](./docs/assets/ogp.jpg)

[![npm](https://flat.badgen.net/npm/v/http-cookie-agent)](https://www.npmjs.com/package/http-cookie-agent)
[![license](https://flat.badgen.net/badge/license/MIT/blue)](LICENSE)
[![standard-readme compliant](https://flat.badgen.net/badge/readme%20style/standard/green)](https://github.com/RichardLitt/standard-readme)

Allows cookies with every Node.js HTTP clients (e.g. undici, axios, node-fetch).

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Supported libraries](#supported-libraries)
  - [Using with HTTP clients](#using-with-http-clients)
  - [Using with another Agent library](#using-with-another-agent-library)
- [Contributing](#contributing)
- [License](#license)

## Install

```bash
npm install http-cookie-agent tough-cookie
```

## Usage

Pass `http-cookie-agent` to HTTP clients instead of http(s).Agent.

```js
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent, MixedCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

const httpAgent = new HttpCookieAgent({ cookies: { jar } });

// To access via HTTPS, use HttpsCookieAgent instead.
const httpsAgent = new HttpsCookieAgent({ cookies: { jar } });

// If the client library cannot switch Agents based on the protocol, use MixedCookieAgent instead.
const mixedAgent = new MixedCookieAgent({ cookies: { jar } });

// Pass agent to HTTP client.
client.request('https://example.com', { agent: httpAgent });
```

### Supported libraries

`undici` / `node:http` / `node:https` / `axios` / `node-fetch` / `got`\*\* / `superagent`\*\* / `request`\*\* / `needle` / `phin` / `@hapi/wreck` / `urllib` etc.

\*\* The library supports cookies by default. You may not need `http-cookie-agent`.

### Using with HTTP clients

See also [examples](./examples) for more details.

#### `undici`

```js
import { fetch, setGlobalDispatcher } from 'undici';
import { CookieJar } from 'tough-cookie';
import { CookieAgent } from 'http-cookie-agent/undici';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } });

setGlobalDispatcher(agent);

await fetch('https://example.com');
```

#### `node:http` / `node:https`

```js
import https from 'node:https';

import { CookieJar } from 'tough-cookie';
import { HttpsCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();
const agent = new HttpsCookieAgent({ cookies: { jar } });

https.get('https://example.com', { agent }, (res) => {
  // ...
});
```

#### `axios`

```js
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

const client = axios.create({
  httpAgent: new HttpCookieAgent({ cookies: { jar } }),
  httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
});

await client.get('https://example.com');
```

#### `node-fetch`

```js
import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

const httpAgent = new HttpCookieAgent({ cookies: { jar } });
const httpsAgent = new HttpsCookieAgent({ cookies: { jar } });

await fetch('https://example.com', {
  agent: ({ protocol }) => {
    return protocol === 'https:' ? httpsAgent : httpAgent;
  },
});
```

#### `got`

:warning: `got` supports cookies by default. You may not need `http-cookie-agent`.

See https://github.com/sindresorhus/got/tree/v11.8.2#cookies.

```js
import got from 'got';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

const client = got.extend({
  agent: {
    http: new HttpCookieAgent({ cookies: { jar } }),
    https: new HttpsCookieAgent({ cookies: { jar } }),
  },
});

await client('https://example.com');
```

#### `superagent`

:warning: `superagent` supports cookies by default. You may not need `http-cookie-agent`.

See https://github.com/visionmedia/superagent/blob/v6.1.0/docs/index.md#saving-cookies.

```js
import superagent from 'superagent';
import { CookieJar } from 'tough-cookie';
import { MixedCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();
const mixedAgent = new MixedCookieAgent({ cookies: { jar } });

const client = superagent.agent().use((req) => req.agent(mixedAgent));

await client.get('https://example.com');
```

#### `request`

:warning: `request` supports cookies by default. You may not need `http-cookie-agent`.

See https://github.com/request/request/tree/v2.88.1#examples.

```js
import request from 'request';
import { CookieJar } from 'tough-cookie';
import { MixedCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

const client = request.defaults({
  agent: new MixedCookieAgent({ cookies: { jar } }),
});

client.get('https://example.com', (_err, _res) => {
  // ...
});
```

#### `needle`

```js
import needle from 'needle';
import { CookieJar } from 'tough-cookie';
import { MixedCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

await needle('get', 'https://example.com', {
  agent: new MixedCookieAgent({ cookies: { jar } }),
});
```

#### `phin`

```js
import phin from 'phin';
import { CookieJar } from 'tough-cookie';
import { MixedCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

await phin({
  url: 'https://example.com',
  core: {
    agent: new MixedCookieAgent({ cookies: { jar } }),
  },
});
```

#### `@hapi/wreck`

```js
import Wreck from '@hapi/wreck';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

const client = Wreck.defaults({
  agents: {
    http: new HttpCookieAgent({ cookies: { jar } }),
    https: new HttpsCookieAgent({ cookies: { jar } }),
    httpsAllowUnauthorized: new HttpsCookieAgent({ cookies: { jar } }),
  },
});

await client.get('https://example.com');
```

#### `urllib`

```js
import urllib from 'urllib';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/node:http';

const jar = new CookieJar();

const client = urllib.create({
  agent: new HttpCookieAgent({ cookies: { jar } }),
  httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
});

await client.request('https://example.com');
```

### Using with an asynchronous Cookie store

`http-cookie-agent` use synchronous CookieJar functions by default.

Therefore, you cannot use an asynchronous Cookie store (e.g. `redis-cookie-store`) by default.

If you want to use an asynchronous Cookie store, set `cookies.async_UNSTABLE` to true.

```js
// node:http, node:https
const jar = new CookieJar();
const agent = new HttpsCookieAgent({ cookies: { async_UNSTABLE: true, jar } });
```

```js
// undici
const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { async_UNSTABLE: true, jar } } });
```

### Using with another Agent library

If you want to use another Agent library, wrap the agent in `createCookieAgent`.

```js
import https from 'node:https';

import { HttpsAgent as KeepAliveAgent } from 'agentkeepalive';
import { CookieJar } from 'tough-cookie';
import { createCookieAgent } from 'http-cookie-agent/node:http';

const Agent = createCookieAgent(KeepAliveAgent);

const jar = new CookieJar();
const agent = new Agent({ cookies: { jar } });

https.get('https://example.com', { agent }, (res) => {
  // ...
});
```

#### `undici`

If you want to use another undici Agent library, use `CookieClient` via factory function.

```js
import { fetch, ProxyAgent, setGlobalDispatcher } from 'undici';
import { CookieJar } from 'tough-cookie';
import { CookieClient } from 'http-cookie-agent/undici';

const jar = new CookieJar();
const agent = new ProxyAgent({
  factory: (origin, opts) => {
    return new CookieClient(origin, {
      ...opts,
      cookies: { jar },
    });
  },
});

setGlobalDispatcher(agent);

await fetch('https://example.com');
```

If you want to use another undici Client library, wrap the client in `createCookieClient`.

```js
import { fetch, Agent, MockClient, setGlobalDispatcher } from 'undici';
import { CookieJar } from 'tough-cookie';
import { createCookieClient } from 'http-cookie-agent/undici';

const CookieClient = createCookieClient(MockClient);

const jar = new CookieJar();
const agent = new Agent({
  factory: (origin, opts) => {
    return new CookieClient(origin, {
      ...opts,
      cookies: { jar },
    });
  },
});

setGlobalDispatcher(agent);

await fetch('https://example.com');
```

## Contributing

PRs accepted.

## License

[MIT (c) 3846masa](../LICENSE)
