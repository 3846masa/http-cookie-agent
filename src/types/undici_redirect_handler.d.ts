declare module 'undici/lib/handler/redirect' {
  import type { Dispatcher } from 'undici';

  export class RedirectHandler implements Dispatcher.DispatchHandlers {
    constructor(
      dispatcher: Dispatcher,
      maxRedirections: number | null,
      opts: unknown,
      handler: Dispatcher.DispatchHandlers,
    );
  }
}
