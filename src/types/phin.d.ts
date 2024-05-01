import 'phin';

declare module 'phin' {
  namespace phin {
    export function defaults(options: Partial<import('phin').IOptions>): typeof import('phin');
  }

  export = phin;
}
