import type { Agent, Client } from 'undici';

interface CookieOptions {
  async_UNSTABLE?: true;
  jar: CookieJar;
}

namespace CookieAgent {
  export interface Options extends Agent.Options {
    cookies?: CookieOptions | undefined;
  }
}

class CookieAgent extends Agent {
  constructor(options: CookieAgent.Options = {});
}

namespace CookieClient {
  export interface Options extends Client.Options {
    cookies?: CookieOptions | undefined;
  }
}

class CookieClient extends Client {
  constructor(url: string | URL, options?: CookieClient.Options);
}

function createCookieClient<BaseClient extends Client = Client, BaseClientOptions = unknown>(
  BaseClient: new (origin: URL, options: BaseClientOptions) => BaseClient,
): new (origin: URL, options: BaseClientOptions & { cookies?: CookieOptions | undefined }) => CookieAgent<BaseAgent>;

export { CookieAgent, CookieClient, createCookieClient };
