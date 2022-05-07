import type http from 'node:http';
import liburl from 'node:url';

import type { CookieOptions } from '../cookie_options';
import { createCookieHeaderValue } from '../utils/create_cookie_header_value';
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

    private [SET_COOKIE_HEADER](req: http.ClientRequest, cookieHeader: string): void {
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

    private [OVERWRITE_REQUEST_EMIT](req: http.ClientRequest, requestUrl: string, cookieOptions: CookieOptions): void {
      const { async_UNSTABLE = false, jar } = cookieOptions;

      const emit = req.emit.bind(req);
      req.emit = (event: string, ...args: unknown[]): boolean => {
        if (event !== 'response') {
          return emit(event, ...args);
        }

        const res = args[0] as http.IncomingMessage;
        const setCookieSync = async_UNSTABLE
          ? // eslint-disable-next-line @typescript-eslint/no-var-requires
            (require('deasync') as typeof import('deasync'))(jar.setCookie.bind(jar))
          : jar.setCookieSync.bind(jar);

        const cookies = res.headers['set-cookie'];
        if (cookies != null) {
          for (const cookie of cookies) {
            setCookieSync(cookie, requestUrl, { ignoreError: true });
          }
        }

        return emit('response', res);
      };
    }

    override addRequest(req: http.ClientRequest, options: http.RequestOptions): void {
      const cookieOptions = this[kCookieOptions];

      if (cookieOptions) {
        const requestUrl = this[GET_REQUEST_URL](req);

        const cookieHeader = createCookieHeaderValue({
          cookieOptions,
          passedValues: [req.getHeader('Cookie')].flat(),
          requestUrl,
        });

        this[SET_COOKIE_HEADER](req, cookieHeader);
        this[OVERWRITE_REQUEST_EMIT](req, requestUrl, cookieOptions);
      }

      super.addRequest(req, options);
    }
  }

  return CookieAgent;
}
