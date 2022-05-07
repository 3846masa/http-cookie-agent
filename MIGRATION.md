# MIGRATION GUIDES

## Migration guide from v2.x.x to v3.0.0

- [The import path has been changed.](#the-import-path-has-been-changed)
- [The property name for passing cookiejar to agent has been changed.](#the-property-name-for-passing-cookiejar-to-agent-has-been-changed)
- [Using synchronous CookieJar functions by default.](#using-synchronous-cookiejar-functions-by-default)

### The import path has been changed.

You should import from `'http-cookie-agent/node:http'` instead of `'http-cookie-agent'`.

```diff
  // CommonJS
- const { HttpCookieAgent } = require('http-cookie-agent');
+ const { HttpCookieAgent } = require('http-cookie-agent/node:http');
```

```diff
  // ES Module
- import { HttpCookieAgent } from 'http-cookie-agent';
+ import { HttpCookieAgent } from 'http-cookie-agent/node:http';
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

If you use an asynchronous cookie store (e.g. `redis-cookie-store`), pass `cookies.async_UNSTABLE` to true.

```diff
  const client = redis.createClient();
  const store = new RedisCookieStore(client);

  const jar = new CookieJar(store);
  const agent = new HttpCookieAgent({
-   cookies: { jar },
+   cookies: { async_UNSTABLE: true, jar },
  });
```
