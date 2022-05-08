import https from 'node:https';

import { createCookieAgent } from './create_cookie_agent';

export const HttpsCookieAgent = createCookieAgent(https.Agent);
