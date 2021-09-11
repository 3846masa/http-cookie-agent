import https from 'https';

import { createCookieAgent } from './create_cookie_agent';

export const HttpsCookieAgent = createCookieAgent(https.Agent);
