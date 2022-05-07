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
const kReimplicitHeader = Symbol('reimplicitHeader');
const kRecreateFirstChunk = Symbol('recreateFirstChunk');
const kOverrideRequest = Symbol('overrideRequest');

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

    private [kReimplicitHeader](req: http.ClientRequest): void {
      const _headerSent = req._headerSent;
      req._header = null;
      req._implicitHeader();
      req._headerSent = _headerSent;
    }

    private [kRecreateFirstChunk](req: http.ClientRequest): void {
      const firstChunk = req.outputData[0];
      if (req._header == null || firstChunk == null) {
        return;
      }

      const prevData = firstChunk.data;
      const prevHeaderLength = prevData.indexOf('\r\n\r\n');

      if (prevHeaderLength === -1) {
        firstChunk.data = req._header;
      } else {
        firstChunk.data = `${req._header}${prevData.slice(prevHeaderLength + 4)}`;
      }

      const diffSize = firstChunk.data.length - prevData.length;
      req.outputSize += diffSize;
      req._onPendingData(diffSize);
    }

    private [kOverrideRequest](req: http.ClientRequest, requestUrl: string, cookieOptions: CookieOptions): void {
      const _implicitHeader = req._implicitHeader.bind(req);
      req._implicitHeader = (): void => {
        try {
          const cookieHeader = createCookieHeaderValue({
            cookieOptions,
            passedValues: [req.getHeader('Cookie')].flat(),
            requestUrl,
          });
          req.setHeader('Cookie', cookieHeader);
        } catch (err) {
          req.destroy(err as Error);
          return;
        }
        return _implicitHeader();
      };

      const emit = req.emit.bind(req);
      req.emit = (event: string, ...args: unknown[]): boolean => {
        if (event === 'response') {
          try {
            const res = args[0] as http.IncomingMessage;
            saveCookiesFromHeader({
              cookieOptions,
              cookies: res.headers['set-cookie'],
              requestUrl,
            });
          } catch (err) {
            req.destroy(err as Error);
            return false;
          }
        }
        return emit(event, ...args);
      };
    }

    override addRequest(req: http.ClientRequest, options: http.RequestOptions): void {
      const cookieOptions = this[kCookieOptions];

      if (cookieOptions) {
        try {
          const requestUrl = liburl.format({
            host: req.host,
            pathname: req.path,
            protocol: req.protocol,
          });
          this[kOverrideRequest](req, requestUrl, cookieOptions);

          if (req._header != null) {
            this[kReimplicitHeader](req);
          }
          if (req._headerSent) {
            this[kRecreateFirstChunk](req);
          }
        } catch (err) {
          req.destroy(err as Error);
          return;
        }
      }

      return super.addRequest(req, options);
    }
  }

  return CookieAgent;
}
