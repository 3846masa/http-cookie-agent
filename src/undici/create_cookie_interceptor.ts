import type { Dispatcher } from 'undici';

import type { CookieOptions } from '../cookie_options';

import { CookieHandler } from './cookie_handler';

export function createCookieInterceptor(cookieOptions: CookieOptions): Dispatcher.DispatcherComposeInterceptor {
  return (dispatch) => {
    return function interceptCookie(dispatchOptions, handler) {
      const cookieHandler = new CookieHandler(dispatch, cookieOptions, handler);
      return cookieHandler.dispatch(dispatchOptions, cookieHandler);
    };
  };
}
