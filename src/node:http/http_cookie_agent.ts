import http from 'node:http';

import { createCookieAgent } from './create_cookie_agent';

export const HttpCookieAgent = createCookieAgent(http.Agent);
