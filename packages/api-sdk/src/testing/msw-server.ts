import { setupServer } from 'msw/node';

import { handlers } from '../mocks/handlers';

/** Kept out of `client`/`endpoints` imports — pulling in `msw/node` here means production bundles that never import this subpath don't carry it. */
export const server = setupServer(...handlers);
