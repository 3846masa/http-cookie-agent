# MIGRATION GUIDES

## Migration guide from v6.x.x to v7.0.0

- [Node.js v18 is no longer supported.](#nodejs-v18-is-no-longer-supported)
- [When using global fetch with Node.js v22, v23, v24, undici v6 should be installed.](#when-using-global-fetch-with-nodejs-v22-v23-v24-undici-v6-should-be-installed)
- [undici v7 supports](#undici-v7-supports)

### Node.js v18 is no longer supported.

Node.js v18 is no longer supported.

### When using global fetch with Node.js v22, v23, v24, undici v6 should be installed.

The global fetch built-in to Node.js v20, v22, and v23 is undici v6.

So, you should install undici v6 and then load `CookieAgent` from `http-cookie-agent/undici/v6`.

```diff
- import { CookieAgent } from 'http-cookie-agent/undici';
+ import { CookieAgent } from 'http-cookie-agent/undici/v6';
```

### undici v7 supports

When using `CookieClient` or `createCookieClient`, you should replace it with the compose method.

```diff
- import { CookieClient } from 'http-cookie-agent/undici';
+ import { cookie } from 'http-cookie-agent/undici';
+ import { Client } from 'undici';

- const client = new CookieClient('https://example.com', { cookie: { jar } });
+ const client = new Client('https://example.com').compose(cookie({ jar }));
```

When using `CookieAgent`, you can use the code as is.
If you want to redirect like undici v6, you can add a "redirect" feature with the compose method.

```typescript
import { CookieAgent } from 'http-cookie-agent/undici';
import { CookieJar } from 'tough-cookie';
import { fetch, interceptors } from 'undici';

const jar = new CookieJar();
const agent = new CookieAgent({ cookies: { jar } }).compose(interceptors.redirect());

await fetch('https://example.com', { dispatcher: agent, maxRedirections: 3 });
```

## Migration guide from v2.x.x to v4.0.0

- [The import path has been changed.](#the-import-path-has-been-changed)
- [The property name for passing CookieJar to Agent has been changed.](#the-property-name-for-passing-cookiejar-to-agent-has-been-changed)
- [Using synchronous CookieJar functions by default.](#using-synchronous-cookiejar-functions-by-default)

### The import path has been changed.

You should import from `'http-cookie-agent/http'` instead of `'http-cookie-agent'`.

```diff
  // CommonJS
- const { HttpCookieAgent } = require('http-cookie-agent');
+ const { HttpCookieAgent } = require('http-cookie-agent/http');
```

```diff
  // ES Module
- import { HttpCookieAgent } from 'http-cookie-agent';
+ import { HttpCookieAgent } from 'http-cookie-agent/http';
```

### The property name for passing CookieJar to Agent has been changed.

```diff
  const jar = new CookieJar();
  const agent = new HttpCookieAgent({
-   jar,
+   cookies: { jar },
  });
```

### Using synchronous CookieJar functions by default.

If you use an asynchronous cookie store (e.g. `redis-cookie-store`), set `cookies.async_UNSTABLE` to true.

```diff
  const client = redis.createClient();
  const store = new RedisCookieStore(client);

  const jar = new CookieJar(store);
  const agent = new HttpCookieAgent({
-   cookies: { jar },
+   cookies: { async_UNSTABLE: true, jar },
  });
```

## Migration guide from v2.x.x to v3.0.0

**`v3.0.0` is deprecated because it cannot work on windows. Please use v4.0.0.**
