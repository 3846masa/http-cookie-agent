import type { IncomingHttpHeaders } from 'node:http';

import { Cookie } from 'tough-cookie';
import { Agent, Client, Dispatcher } from 'undici';
import { kDispatch, kMaxRedirections, kUrl } from 'undici/lib/core/symbols';
import { RedirectHandler } from 'undici/lib/handler/redirect';

import { CookieHandler } from './cookie_handler';
import type { CookieOptions } from './cookie_options';
import { convertToHeadersObject } from './utils/convert_to_headers_object';
import { validateCookieOptions } from './utils/validate_cookie_options';

const kCookieOptions = Symbol('cookieOptions');
const kAppendCookieHeader = Symbol('appendCookieHeader');

function createCookieClient<BaseClient extends Client = Client, BaseClientOptions = Client.Options>(
  BaseClientClass: new (origin: string | URL, options: BaseClientOptions) => BaseClient,
) {
  type CookieClientOptions = BaseClientOptions & {
    cookies?: CookieOptions | undefined;
  };

  // @ts-expect-error ...
  class CookieClient extends BaseClientClass {
    private [kCookieOptions]: CookieOptions | undefined;

    constructor(
      url: string | URL,
      { cookies: cookieOpts, ...options }: CookieClientOptions = {} as CookieClientOptions,
    ) {
      super(url, options as BaseClientOptions);

      if (cookieOpts) {
        validateCookieOptions(cookieOpts);
        this[kCookieOptions] = cookieOpts;
      }
    }

    override [kDispatch](opts: Agent.DispatchOptions, handler: Dispatcher.DispatchHandlers) {
      const { maxRedirections = this[kMaxRedirections] } = opts;

      if (maxRedirections) {
        opts = { ...opts, maxRedirections: 0 };
        handler = new RedirectHandler(this, maxRedirections, opts, handler);
      }

      const cookieOptions = this[kCookieOptions];
      if (cookieOptions) {
        const origin = opts.origin || this[kUrl].origin;
        const requestUrl = new URL(opts.path, origin).toString();
        const headers = this[kAppendCookieHeader](requestUrl, convertToHeadersObject(opts.headers), cookieOptions);

        opts = { ...opts, headers };
        handler = new CookieHandler(requestUrl, cookieOptions, handler);
      }

      return super[kDispatch](opts, handler);
    }

    private [kAppendCookieHeader](
      requestUrl: string,
      _headers: IncomingHttpHeaders,
      cookieOpts: CookieOptions,
    ): IncomingHttpHeaders {
      const { async_UNSTABLE = false, jar } = cookieOpts;
      const headers = { ..._headers };

      const getCookiesSync = async_UNSTABLE
        ? // eslint-disable-next-line @typescript-eslint/no-var-requires
          (require('deasync') as typeof import('deasync'))(jar.getCookies.bind(jar))
        : jar.getCookiesSync.bind(jar);

      const cookies = getCookiesSync(requestUrl);
      const cookiesMap = new Map(cookies.map((cookie) => [cookie.key, cookie]));

      if (typeof headers['cookie'] === 'string') {
        for (const str of headers['cookie'].split(';')) {
          const cookie = Cookie.parse(str.trim());
          if (cookie != null) {
            cookiesMap.set(cookie.key, cookie);
          }
        }
      }

      headers['cookie'] = Array.from(cookiesMap.values())
        .map((cookie) => cookie.cookieString())
        .join(';\x20');

      return headers;
    }
  }

  return CookieClient;
}

const CookieClient = createCookieClient(Client);

export { CookieClient, createCookieClient };
