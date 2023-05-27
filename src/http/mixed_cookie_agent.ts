import type http from 'node:http';
import type https from 'node:https';

import type { AgentConnectOpts } from 'agent-base';
import { Agent as AgentBase } from 'agent-base';

import type { CookieAgentOptions } from './create_cookie_agent';
import { HttpCookieAgent } from './http_cookie_agent';
import { HttpsCookieAgent } from './https_cookie_agent';

export class MixedCookieAgent extends AgentBase {
  private _httpAgent: http.Agent;
  private _httpsAgent: https.Agent;

  constructor(options: http.AgentOptions & https.AgentOptions & CookieAgentOptions) {
    super();
    this._httpAgent = new HttpCookieAgent(options);
    this._httpsAgent = new HttpsCookieAgent(options);
  }

  override connect(_req: http.ClientRequest, options: AgentConnectOpts) {
    return options.secureEndpoint ? this._httpsAgent : this._httpAgent;
  }
}
