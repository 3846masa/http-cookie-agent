/* global Buffer */
import type { Duplex } from 'node:stream';

import type { Dispatcher } from 'undici';
import { errors } from 'undici';

import type { CookieOptions } from '../cookie_options';
import { saveCookiesFromHeader } from '../utils/save_cookies_from_header';

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

  onResponseStarted = (): void => {
    this[kHandlers].onResponseStarted?.();
  };

  onConnect = (abort: () => void): void => {
    this[kHandlers].onConnect?.(abort);
  };

  onError = (err: Error): void => {
    this[kHandlers].onError?.(err);
  };

  onUpgrade = (statusCode: number, headers: string[] | null, socket: Duplex): void => {
    this[kHandlers].onUpgrade?.(statusCode, headers, socket);
  };

  onHeaders = (statusCode: number, _headers: Buffer[], resume: () => void, statusText: string): boolean => {
    if (this[kHandlers].onHeaders == null) {
      throw new errors.InvalidArgumentError('invalid onHeaders method');
    }

    const headers = convertToHeadersObject(_headers);
    saveCookiesFromHeader({
      cookieOptions: this[kCookieOptions],
      cookies: headers['set-cookie'],
      requestUrl: this[kRequestUrl],
    });

    return this[kHandlers].onHeaders(statusCode, _headers, resume, statusText);
  };

  onData = (chunk: Buffer): boolean => {
    if (this[kHandlers].onData == null) {
      throw new errors.InvalidArgumentError('invalid onData method');
    }
    return this[kHandlers].onData(chunk);
  };

  onComplete = (trailers: string[] | null): void => {
    this[kHandlers].onComplete?.(trailers);
  };

  onBodySent = (chunkSize: number, totalBytesSent: number): void => {
    this[kHandlers].onBodySent?.(chunkSize, totalBytesSent);
  };
}

export { CookieHandler };
