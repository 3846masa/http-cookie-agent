declare module 'proxy' {
  import type http from 'node:http';
  const setup: (server: http.Server) => http.Server;
  export default setup;
}
