import 'undici';

declare module 'undici' {
  import type { Agent, Dispatcher } from 'undici';
  import type { kDispatch, kMaxRedirections, kUrl } from 'undici/lib/core/symbols';

  interface Client {
    [kDispatch](opts: Agent.DispatchOptions, handler: Dispatcher.DispatchHandlers): boolean;
    [kMaxRedirections]: number;
    [kUrl]: URL;
  }
}
