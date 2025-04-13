/* global Buffer */
import type { Duplex } from 'node:stream';

import type { Dispatcher } from 'undici';
import type { IncomingHttpHeaders } from 'undici/types/header';

import type { CookieOptions } from '../cookie_options';
import { convertToHeadersObject } from '../utils/convert_to_headers_object';
import { createCookieHeaderValue } from '../utils/create_cookie_header_value';
import { saveCookiesFromHeader } from '../utils/save_cookies_from_header';
import { validateCookieOptions } from '../utils/validate_cookie_options';

type UndiciV7HandlerMethods =
  | 'onRequestStart'
  | 'onRequestUpgrade'
  | 'onResponseStart'
  | 'onResponseData'
  | 'onResponseEnd'
  | 'onResponseError';

const kRequestUrl = Symbol('requestUrl');
const kCookieOptions = Symbol('cookieOptions');
const kDispatchHandler = Symbol('dispatchHandler');
const kDispatch = Symbol('dispatch');

class CookieHandler implements Pick<Required<Dispatcher.DispatchHandler>, UndiciV7HandlerMethods> {
  private [kRequestUrl]: string | null;
  private [kCookieOptions]: CookieOptions;
  private [kDispatchHandler]: Dispatcher.DispatchHandler;
  private [kDispatch]: Dispatcher['dispatch'];

  constructor(dispatch: Dispatcher['dispatch'], cookieOptions: CookieOptions, handler: Dispatcher.DispatchHandler) {
    validateCookieOptions(cookieOptions);
    this[kRequestUrl] = null;
    this[kCookieOptions] = cookieOptions;
    this[kDispatchHandler] = handler;
    this[kDispatch] = dispatch;
  }

  dispatch(options: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandler): boolean {
    const cookieOptions = this[kCookieOptions];
    const requestUrl = new URL(options.path, options.origin).toString();

    const headers = convertToHeadersObject(options.headers);
    options.headers = headers;

    headers['cookie'] = createCookieHeaderValue({
      cookieOptions,
      passedValues: [headers['cookie']].flat(),
      requestUrl,
    });
    this[kRequestUrl] = requestUrl;

    return this[kDispatch](options, handler);
  }

  onRequestStart(controller: Dispatcher.DispatchController, context: unknown): void {
    this[kDispatchHandler].onRequestStart?.(controller, context);
  }

  onRequestUpgrade(
    controller: Dispatcher.DispatchController,
    statusCode: number,
    headers: IncomingHttpHeaders,
    socket: Duplex,
  ): void {
    this[kDispatchHandler].onRequestUpgrade?.(controller, statusCode, headers, socket);
  }

  onResponseStart(
    controller: Dispatcher.DispatchController,
    statusCode: number,
    headers: IncomingHttpHeaders,
    statusMessage?: string,
  ): void {
    const cookieOptions = this[kCookieOptions];
    const requestUrl = this[kRequestUrl];

    if (requestUrl != null) {
      saveCookiesFromHeader({
        cookieOptions,
        cookies: convertToHeadersObject(headers)['set-cookie'],
        requestUrl,
      });
    }

    this[kDispatchHandler].onResponseStart?.(controller, statusCode, headers, statusMessage);
  }

  onResponseData(controller: Dispatcher.DispatchController, chunk: Buffer): void {
    this[kDispatchHandler].onResponseData?.(controller, chunk);
  }

  onResponseEnd(controller: Dispatcher.DispatchController, trailers: IncomingHttpHeaders): void {
    this[kDispatchHandler].onResponseEnd?.(controller, trailers);
  }

  onResponseError(controller: Dispatcher.DispatchController, error: Error): void {
    this[kDispatchHandler].onResponseError?.(controller, error);
  }
}

export { CookieHandler };
