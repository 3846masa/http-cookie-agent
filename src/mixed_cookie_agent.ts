import type http from 'node:http';
import type https from 'node:https';

import agentBase from 'agent-base';
import type { CookieJar } from 'tough-cookie';

import type { CookieAgentOptions } from './create_cookie_agent';
import { HttpCookieAgent } from './http_cookie_agent';
import { HttpsCookieAgent } from './https_cookie_agent';

export class MixedCookieAgent extends agentBase.Agent {
  jar: CookieJar;
  private _httpAgent: http.Agent;
  private _httpsAgent: https.Agent;

  constructor(options: http.AgentOptions & https.AgentOptions & CookieAgentOptions) {
    super();
    this._httpAgent = new HttpCookieAgent(options);
    this._httpsAgent = new HttpsCookieAgent(options);
    this.jar = options.jar;
  }

  override callback(_req: agentBase.ClientRequest, options: agentBase.RequestOptions) {
    return options.secureEndpoint ? this._httpsAgent : this._httpAgent;
  }
}
