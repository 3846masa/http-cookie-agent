import type { Duplex } from 'node:stream';

import type { Dispatcher } from 'undici';
import { errors } from 'undici';

import type { CookieOptions } from '../cookie_options';

import { convertToHeadersObject } from './utils/convert_to_headers_object';

const kRequestUrl = Symbol('requestUrl');
const kCookieOptions = Symbol('cookieOptions');
const kHandlers = Symbol('handlers');

class CookieHandler implements Required<Dispatcher.DispatchHandlers> {
  private [kRequestUrl]: string;
  private [kCookieOptions]: CookieOptions;
  private [kHandlers]: Dispatcher.DispatchHandlers;

  constructor(requestUrl: string, cookieOptions: CookieOptions, handlers: Dispatcher.DispatchHandlers) {
    this[kRequestUrl] = requestUrl;
    this[kCookieOptions] = cookieOptions;
    this[kHandlers] = handlers;
  }

  onConnect = (abort: () => void): void => {
    this[kHandlers].onConnect?.(abort);
  };

  onError = (err: Error): void => {
    this[kHandlers].onError?.(err);
  };

  onUpgrade = (statusCode: number, headers: string[] | null, socket: Duplex): void => {
    this[kHandlers].onUpgrade?.(statusCode, headers, socket);
  };

  onHeaders = (statusCode: number, _headers: string[] | null, resume: () => void): boolean => {
    if (this[kHandlers].onHeaders == null) {
      throw new errors.InvalidArgumentError('invalid onHeaders method');
    }

    const { async_UNSTABLE, jar } = this[kCookieOptions];
    const headers = convertToHeadersObject(_headers);

    const setCookieSync = async_UNSTABLE
      ? // eslint-disable-next-line @typescript-eslint/no-var-requires
        (require('deasync') as typeof import('deasync'))(jar.setCookie.bind(jar))
      : jar.setCookieSync.bind(jar);

    const cookies = [headers['set-cookie']].flat();

    for (const cookie of cookies) {
      if (cookie == null) {
        continue;
      }
      setCookieSync(cookie, this[kRequestUrl], { ignoreError: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this[kHandlers].onHeaders!(statusCode, _headers, resume);
  };

  onData = (chunk: Buffer): boolean => {
    if (this[kHandlers].onData == null) {
      throw new errors.InvalidArgumentError('invalid onData method');
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this[kHandlers].onData!(chunk);
  };

  onComplete = (trailers: string[] | null): void => {
    this[kHandlers].onComplete?.(trailers);
  };

  onBodySent = (chunkSize: number, totalBytesSent: number): void => {
    this[kHandlers].onBodySent?.(chunkSize, totalBytesSent);
  };
}

export { CookieHandler };
