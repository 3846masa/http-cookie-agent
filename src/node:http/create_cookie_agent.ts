import type http from 'node:http';
import liburl from 'node:url';

import { Cookie } from 'tough-cookie';

import type { CookieOptions } from '../cookie_options';
import { validateCookieOptions } from '../utils/validate_cookie_options';

declare module 'http' {
  interface Agent {
    addRequest(req: http.ClientRequest, options: http.RequestOptions): void;
  }
  interface ClientRequest {
    _header: string | null;
    _headerSent: boolean;
    _implicitHeader(): void;
    _onPendingData(amount: number): void;
    outputData: Array<{
      callback: unknown;
      data: string;
      encoding: string;
    }>;
    outputSize: number;
  }
}

export type CookieAgentOptions = {
  cookies?: CookieOptions | undefined;
};

const kCookieOptions = Symbol('cookieOptions');
const GET_REQUEST_URL = Symbol('getRequestUrl');
const SET_COOKIE_HEADER = Symbol('setCookieHeader');
const CREATE_COOKIE_HEADER_STRING = Symbol('createCookieHeaderString');
const OVERWRITE_REQUEST_EMIT = Symbol('overwriteRequestEmit');

export function createCookieAgent<
  BaseAgent extends http.Agent = http.Agent,
  BaseAgentOptions = unknown,
  BaseAgentConstructorRestParams extends unknown[] = unknown[],
>(BaseAgentClass: new (options: BaseAgentOptions, ...rest: BaseAgentConstructorRestParams) => BaseAgent) {
  // @ts-expect-error ...
  class CookieAgent extends BaseAgentClass {
    [kCookieOptions]: CookieOptions | undefined;

    constructor(
      { cookies: cookieOptions, ...options }: BaseAgentOptions & CookieAgentOptions = {} as BaseAgentOptions,
      ...rest: BaseAgentConstructorRestParams
    ) {
      super(options as BaseAgentOptions, ...rest);

      if (cookieOptions) {
        validateCookieOptions(cookieOptions);
      }
      this[kCookieOptions] = cookieOptions;
    }

    private [GET_REQUEST_URL](req: http.ClientRequest): string {
      const requestUrl = liburl.format({
        host: req.host,
        pathname: req.path,
        protocol: req.protocol,
      });

      return requestUrl;
    }

    private async [CREATE_COOKIE_HEADER_STRING](
      req: http.ClientRequest,
      cookieOptions: CookieOptions,
    ): Promise<string> {
      const { jar } = cookieOptions;
      const requestUrl = this[GET_REQUEST_URL](req);

      const cookies = await jar.getCookies(requestUrl);
      const cookiesMap = new Map(cookies.map((cookie) => [cookie.key, cookie]));

      const cookieHeaderList = [req.getHeader('Cookie')].flat();

      for (const header of cookieHeaderList) {
        if (typeof header !== 'string') {
          continue;
        }

        for (const str of header.split(';')) {
          const cookie = Cookie.parse(str.trim());
          if (cookie == null) {
            continue;
          }
          cookiesMap.set(cookie.key, cookie);
        }
      }

      const cookieHeader = Array.from(cookiesMap.values())
        .map((cookie) => cookie.cookieString())
        .join(';\x20');

      return cookieHeader;
    }

    private async [SET_COOKIE_HEADER](req: http.ClientRequest, cookieOptions: CookieOptions): Promise<void> {
      const cookieHeader = await this[CREATE_COOKIE_HEADER_STRING](req, cookieOptions);

      if (cookieHeader === '') {
        return;
      }
      if (req._header == null) {
        req.setHeader('Cookie', cookieHeader);
        return;
      }

      const alreadyHeaderSent = req._headerSent;

      req._header = null;
      req.setHeader('Cookie', cookieHeader);
      req._implicitHeader();
      req._headerSent = alreadyHeaderSent;

      if (alreadyHeaderSent !== true) {
        return;
      }

      const firstChunk = req.outputData.shift();
      if (firstChunk == null) {
        return;
      }

      const dataWithoutHeader = firstChunk.data.split('\r\n\r\n').slice(1).join('\r\n\r\n');

      const chunk = {
        ...firstChunk,
        data: `${req._header}${dataWithoutHeader}`,
      };
      req.outputData.unshift(chunk);

      const diffSize = chunk.data.length - firstChunk.data.length;
      req.outputSize += diffSize;
      req._onPendingData(diffSize);
    }

    private async [OVERWRITE_REQUEST_EMIT](req: http.ClientRequest, cookieOptions: CookieOptions): Promise<void> {
      const { jar } = cookieOptions;
      const requestUrl = this[GET_REQUEST_URL](req);

      const emit = req.emit.bind(req);
      req.emit = (event: string, ...args: unknown[]): boolean => {
        if (event !== 'response') {
          return emit(event, ...args);
        }

        const res = args[0] as http.IncomingMessage;

        (async () => {
          const cookies = res.headers['set-cookie'];
          if (cookies != null) {
            for (const cookie of cookies) {
              await jar.setCookie(cookie, requestUrl, { ignoreError: true });
            }
          }
        })()
          .then(() => emit('response', res))
          .catch((err) => emit('error', err));

        return req.listenerCount(event) !== 0;
      };
    }

    override addRequest(req: http.ClientRequest, options: http.RequestOptions): void {
      const cookieOptions = this[kCookieOptions];

      if (cookieOptions) {
        Promise.resolve()
          .then(() => this[SET_COOKIE_HEADER](req, cookieOptions))
          .then(() => this[OVERWRITE_REQUEST_EMIT](req, cookieOptions))
          .then(() => super.addRequest(req, options))
          .catch((err) => req.emit('error', err));
      } else {
        super.addRequest(req, options);
      }
    }
  }

  return CookieAgent;
}
