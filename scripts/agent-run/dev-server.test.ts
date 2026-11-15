// @vitest-environment node
import { createServer, type Server } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { isPortBusy } from './dev-server';

let server: Server | undefined;
afterEach(() => new Promise<void>((r) => (server ? server.close(() => r()) : r())));

describe('isPortBusy', () => {
  it('detects a listening port and a free one', async () => {
    server = createServer();
    await new Promise<void>((r) => server!.listen(0, '127.0.0.1', r));
    const port = (server.address() as { port: number }).port;
    expect(await isPortBusy(port)).toBe(true);
    await new Promise<void>((r) => server!.close(() => r()));
    server = undefined;
    expect(await isPortBusy(port)).toBe(false);
  });
});
