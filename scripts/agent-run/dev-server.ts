/** Real `pnpm dev --port N` for the UI checks (D30): started and stopped by the script, never by an agent. */
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';

import type { DevServer } from './deps';

export function isPortBusy(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const realDevServer: DevServer = {
  async start(cwd, port) {
    if (await isPortBusy(port)) return { ok: false, reason: `cổng ${port} đang bận` };
    const child = spawn('pnpm', ['dev', '--port', String(port)], { cwd, detached: true, stdio: 'ignore' });
    let exited = false;
    child.on('exit', () => (exited = true));
    const stop = async () => {
      if (!exited && child.pid) {
        try {
          process.kill(-child.pid, 'SIGTERM');
        } catch {
          // already gone
        }
      }
    };
    for (let i = 0; i < 120 && !exited; i++) {
      if (await isPortBusy(port)) return { ok: true, stop };
      await sleep(1000);
    }
    await stop();
    return { ok: false, reason: exited ? 'pnpm dev thoát sớm' : 'pnpm dev không trả lời sau 120s' };
  },
};
