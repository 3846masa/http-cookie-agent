declare module 'undici/lib/handler/redirect' {
  import type { Dispatcher } from 'undici';

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  export class RedirectHandler implements Dispatcher.DispatchHandlers {
    constructor(
      dispatcher: Dispatcher,
      maxRedirections: number | null,
      opts: unknown,
      handler: Dispatcher.DispatchHandlers,
    );
  }
}
