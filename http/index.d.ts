import type { Agent as HttpAgent, AgentOptions as HttpAgentOptions } from 'node:http';
import type { Agent as HttpsAgent, AgentOptions as HttpsAgentOptions } from 'node:https';

import type { CookieJar } from 'tough-cookie';

export interface CookieOptions {
  jar: CookieJar;
}

export type CookieAgentOptions = {
  cookies?: CookieOptions | undefined;
};

type CookieAgent<BaseAgent extends HttpAgent> = BaseAgent;

type WithCookieAgentOptions<T> = T extends HttpAgentOptions ? T & CookieAgentOptions : T;
type ConstructorParams<Params extends unknown[]> = {
  [Index in keyof Params]: WithCookieAgentOptions<Params[Index]>;
};

export function createCookieAgent<BaseAgent extends HttpAgent = HttpAgent, Params extends unknown[] = unknown[]>(
  BaseAgent: new (...rest: Params) => BaseAgent,
): new (...rest: ConstructorParams<Params>) => CookieAgent<BaseAgent>;

export const HttpCookieAgent: new (options: HttpAgentOptions & CookieAgentOptions) => CookieAgent<HttpAgent>;
export const HttpsCookieAgent: new (options: HttpsAgentOptions & CookieAgentOptions) => CookieAgent<HttpsAgent>;
export const MixedCookieAgent: new (
  options: HttpAgentOptions & HttpsAgentOptions & CookieAgentOptions,
) => CookieAgent<HttpsAgent>;
