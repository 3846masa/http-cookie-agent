import type * as http from 'node:http';
import type * as https from 'node:https';

import type { CookieJar } from 'tough-cookie';

export interface CookieOptions {
  jar: CookieJar;
}

export type CookieAgentOptions = {
  cookies?: CookieOptions | undefined;
};

type CookieAgent<BaseAgent extends http.Agent> = BaseAgent;

type WithCookieAgentOptions<T> = T extends http.AgentOptions ? T & CookieAgentOptions : T;
type ConstructorParams<Params extends unknown[]> = {
  [Index in keyof Params]: WithCookieAgentOptions<Params[Index]>;
};

export function createCookieAgent<BaseAgent extends http.Agent = http.Agent, Params extends unknown[] = unknown[]>(
  BaseAgentClass: new (...rest: Params) => BaseAgent,
): new (...rest: ConstructorParams<Params>) => CookieAgent<BaseAgent>;

export const HttpCookieAgent: new (options: http.AgentOptions & CookieAgentOptions) => CookieAgent<http.Agent>;
export const HttpsCookieAgent: new (options: https.AgentOptions & CookieAgentOptions) => CookieAgent<https.Agent>;
export const MixedCookieAgent: new (
  options: http.AgentOptions & https.AgentOptions & CookieAgentOptions,
) => CookieAgent<https.Agent>;
