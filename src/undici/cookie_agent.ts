import { Agent } from 'undici';

import type { CookieOptions } from '../cookie_options';

import { createCookieInterceptor } from './create_cookie_interceptor';

type CookieAgentOptions = Agent.Options & {
  cookies?: CookieOptions | undefined;
};

class CookieAgent extends Agent {
  constructor({ cookies: cookieOpts, ...agentOpts }: CookieAgentOptions) {
    super({ ...agentOpts });

    if (cookieOpts != null) {
      return this.compose(createCookieInterceptor(cookieOpts)) as this;
    } else {
      return this;
    }
  }
}

export { CookieAgent };
