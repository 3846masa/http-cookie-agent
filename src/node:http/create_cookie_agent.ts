import type http from 'node:http';
import liburl from 'node:url';

import type { CookieOptions } from '../cookie_options';
import { createCookieHeaderValue } from '../utils/create_cookie_header_value';
import { saveCookiesFromHeader } from '../utils/save_cookies_from_header';
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
const kSetCookieHeader = Symbol('setCookieHeader');
const kOverwriteRequestEmit = Symbol('overwriteRequestEmit');

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

    private [kSetCookieHeader](req: http.ClientRequest, cookieHeader: string): void {
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

    private [kOverwriteRequestEmit](req: http.ClientRequest, requestUrl: string, cookieOptions: CookieOptions): void {
      const emit = req.emit.bind(req);

      req.emit = (event: string, ...args: unknown[]): boolean => {
        if (event === 'response') {
          const res = args[0] as http.IncomingMessage;
          saveCookiesFromHeader({
            cookieOptions,
            cookies: res.headers['set-cookie'],
            requestUrl,
          });
        }
        return emit(event, ...args);
      };
    }

    override addRequest(req: http.ClientRequest, options: http.RequestOptions): void {
      const cookieOptions = this[kCookieOptions];

      if (cookieOptions) {
        const requestUrl = liburl.format({
          host: req.host,
          pathname: req.path,
          protocol: req.protocol,
        });

        const cookieHeader = createCookieHeaderValue({
          cookieOptions,
          passedValues: [req.getHeader('Cookie')].flat(),
          requestUrl,
        });

        this[kSetCookieHeader](req, cookieHeader);
        this[kOverwriteRequestEmit](req, requestUrl, cookieOptions);
      }

      super.addRequest(req, options);
    }
  }

  return CookieAgent;
}
