import { setupWorker } from 'msw/browser';

import { handlers } from '../mocks/handlers';

/** Kept out of `client`/`endpoints` imports — pulling in `msw/browser` here means production bundles that never import this subpath don't carry it. */
export const worker = setupWorker(...handlers);
