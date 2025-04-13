import type { Agent, Dispatcher } from 'undici';
import { Client, RedirectHandler } from 'undici';
import Symbols from 'undici/lib/core/symbols';

import type { CookieOptions } from '../../cookie_options';
import { convertToHeadersObject } from '../../utils/convert_to_headers_object';
import { createCookieHeaderValue } from '../../utils/create_cookie_header_value';
import { validateCookieOptions } from '../../utils/validate_cookie_options';

import { CookieHandler } from './cookie_handler';

const kCookieOptions = Symbol('cookieOptions');

function createCookieClient<BaseClient extends Client = Client, BaseClientOptions = Client.Options>(
  BaseClientClass: new (origin: string | URL, options: BaseClientOptions) => BaseClient,
) {
  type CookieClientOptions = BaseClientOptions & {
    cookies?: CookieOptions | undefined;
  };

  // @ts-expect-error -- BaseClientClass is type definition.
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

    override [Symbols.kDispatch](opts: Agent.DispatchOptions, handler: Dispatcher.DispatchHandler) {
      const { maxRedirections = this[Symbols.kMaxRedirections] } = opts;

      if (maxRedirections) {
        opts = { ...opts, maxRedirections: 0 };
        handler = new RedirectHandler(this, maxRedirections, opts, handler, false);
      }

      const cookieOptions = this[kCookieOptions];
      if (cookieOptions) {
        const origin = opts.origin || this[Symbols.kUrl].origin;
        const requestUrl = new URL(opts.path, origin).toString();
        const headers = convertToHeadersObject(opts.headers);

        const cookieHeader = createCookieHeaderValue({
          cookieOptions,
          passedValues: [headers['cookie']].flat(),
          requestUrl,
        });
        if (cookieHeader) {
          headers['cookie'] = cookieHeader;
        }

        opts = { ...opts, headers };
        handler = new CookieHandler(requestUrl, cookieOptions, handler);
      }

      return super[Symbols.kDispatch](opts, handler);
    }
  }

  return CookieClient;
}

const CookieClient = createCookieClient(Client);

export { CookieClient, createCookieClient };
