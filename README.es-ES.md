# HTTP Cookie Agent

![HTTP Cookie Agent](./docs/assets/ogp.jpg)

[![github sponsors](https://flat.badgen.net/badge/GitHub%20Sponsors/Support%20me%20%E2%9D%A4/ff69b4?icon=github)](https://github.com/sponsors/3846masa)
[![npm](https://flat.badgen.net/npm/v/http-cookie-agent)](https://www.npmjs.com/package/http-cookie-agent)
[![license](https://flat.badgen.net/badge/license/MIT/blue)](LICENSE)
[![standard-readme compliant](https://flat.badgen.net/badge/readme%20style/standard/green)](https://github.com/RichardLitt/standard-readme)

Permite el uso de cookies con todos los clientes HTTP de Node.js (ej. Node.js global fetch, undici, axios, node-fetch).

## Tabla de Contenidos

- [Instalación](#install)
- [Uso](#usage)
  - [Librerías soportadas](#supported-libraries)
  - [Uso con otra librería de Agent](#using-with-another-agent-library)
- [Contribución](#contributing)
- [Licencia](#license)

## Instalación

```bash
npm install http-cookie-agent tough-cookie
```

## Uso

Consulte también los [ejemplos](./examples) para más detalles.

### Librerías soportadas

| Librería              | ¿Soportado?       |
| -------------------- | ----------------- |
| Node.js global fetch | ✅                |
| `undici`             | ✅                |
| `node:http`          | ✅                |
| `node:https`         | ✅                |
| `axios`              | ✅                |
| `node-fetch`         | ✅                |
| `got`                | ✅ <sup>\*1</sup> |
| `superagent`         | ✅ <sup>\*1</sup> |
| `needle`             | ✅                |
| `@hapi/wrech`        | ✅                |
| `urllib`             | ✅                |
| Bun global fetch     | ❌ <sup>\*2</sup> |
| Deno global fetch    | ❌ <sup>\*2</sup> |

\*1: Esta librería soporta cookies por defecto. Es posible que no necesite `http-cookie-agent`.

\*2: Tienen una implementación de fetch propietaria y [actualmente no están soportadas](https://github.com/3846masa/http-cookie-agent/issues/692).

#### Node.js global fetch

Cuando quiera usar el fetch global de Node.js, debe instalar `undici` adicionalmente.

| Versión de Node.js | Versión de undici        |
| ------------------- | ------------------------ |
| v26                | `npm install undici@8`  |
| v24                | `npm install undici@7`  |
| v22                | `npm install undici@6`  |

```js
import { CookieJar } from 'tough-cookie';
import { CookieAgent } from 'http-cookie-agent/undici/v6';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } });

await fetch('https://example.com', { dispatcher: agent });
```

#### `undici`

```js
import { fetch } from 'undici';
import { CookieJar } from 'tough-cookie';
import { CookieAgent } from 'http-cookie-agent/undici';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } });

await fetch('https://example.com', { dispatcher: agent });
```

Alternativamente, `http-cookie-agent` puede usarse como [interceptores](https://github.com/nodejs/undici/blob/v7.0.0/docs/docs/api/Dispatcher.md#dispatchercomposeinterceptors-interceptor).
En este caso, `cookie()` debe colocarse al principio de los interceptores.

```js
import { fetch, interceptors } from 'undici';
import { CookieJar } from 'tough-cookie';
import { cookie } from 'http-cookie-agent/undici';

const jar = new CookieJar();
const agent = new Agent()
  .compose(cookie({ jar }))
  .compose(interceptors.retry())
  .compose(interceptors.redirect({ maxRedirections: 3 }));

await fetch('https://example.com', { dispatcher: agent });
```

#### `node:http` / `node:https`

```js
import https from 'node:https';

import { CookieJar } from 'tough-cookie';
import { HttpsCookieAgent } from 'http-cookie-agent/http';

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
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';

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
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';

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

:warning: `got` soporta cookies por defecto. Es posible que no necesite `http-cookie-agent`.

Vea https://github.com/sindresorhus/got/tree/v11.8.2#cookies.

```js
import got from 'got';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';

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

:warning: `superagent` soporta cookies por defecto. Es posible que no necesite `http-cookie-agent`.

Vea https://github.com/visionmedia/superagent/blob/v6.1.0/docs/index.md#saving-cookies.

```js
import superagent from 'superagent';
import { CookieJar } from 'tough-cookie';
import { MixedCookieAgent } from 'http-cookie-agent/http';

const jar = new CookieJar();
const mixedAgent = new MixedCookieAgent({ cookies: { jar } });

const client = superagent.agent().use((req) => req.agent(mixedAgent));

await client.get('https://example.com');
```

#### `needle`

```js
import needle from 'needle';
import { CookieJar } from 'tough-cookie';
import { MixedCookieAgent } from 'http-cookie-agent/http';

const jar = new CookieJar();

await needle('get', 'https://example.com', {
  agent: new MixedCookieAgent({ cookies: { jar } }),
});
```

#### `@hapi/wreck`

```js
import Wreck from '@hapi/wreck';
import { CookieJar } from 'tough-cookie';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';

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
import { request, setGlobalDispatcher } from 'urllib';
import { CookieJar } from 'tough-cookie';
import { CookieAgent } from 'http-cookie-agent/undici';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } });
setGlobalDispatcher(agent);

await request('https://example.com');
```

### Uso con otra librería de Agent

Si desea utilizar otra librería de Agent, envuelva el agent en `createCookieAgent`.

```js
import https from 'node:https';

import { HttpsAgent as KeepAliveAgent } from 'agentkeepalive';
import { CookieJar } from 'tough-cookie';
import { createCookieAgent } from 'http-cookie-agent/http';

const Agent = createCookieAgent(KeepAliveAgent);

const jar = new CookieJar();
const agent = new Agent({ cookies: { jar } });

https.get('https://example.com', { agent }, (res) => {
  // ...
});
```

#### `undici`

Si desea utilizar otra librería de Agent de undici, use `cookie` con el método compose.

```js
import { fetch, ProxyAgent } from 'undici';
import { CookieJar } from 'tough-cookie';
import { cookie } from 'http-cookie-agent/undici';

const jar = new CookieJar();
const agent = new ProxyAgent({
  /* ... */
}).compose(cookie({ jar }));

await fetch('https://example.com', { dispatcher: agent });
```

## Contribución

Se aceptan PRs.

## Licencia

[MIT (c) 3846masa](../LICENSE)
