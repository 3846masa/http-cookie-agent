import { Agent, errors, Pool } from 'undici';

import type { CookieOptions } from '../cookie_options';
import { validateCookieOptions } from '../utils/validate_cookie_options';

import { CookieClient } from './cookie_client';

type CookieAgentOptions = Agent.Options & {
  cookies?: CookieOptions | undefined;
};

class CookieAgent extends Agent {
  constructor({ cookies: cookieOpts, ...agentOpts }: CookieAgentOptions = {}) {
    if (agentOpts.factory) {
      throw new errors.InvalidArgumentError('factory function cannot set via CookieAgent');
    }

    if (cookieOpts) {
      validateCookieOptions(cookieOpts);
    }

    function factory(origin: URL, opts?: CookieAgentOptions & Pool.Options) {
      if (opts && opts.connections === 1) {
        return new CookieClient(origin, {
          ...opts,
          cookies: cookieOpts,
        });
      } else {
        return new Pool(origin, {
          ...opts,
          factory: (origin, opts) => {
            return new CookieClient(origin, {
              ...opts,
              cookies: cookieOpts,
            });
          },
        });
      }
    }

    super({ ...agentOpts, factory });
  }
}

export { CookieAgent };
