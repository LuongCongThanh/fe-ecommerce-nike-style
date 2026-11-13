import { enableApiMockingServer } from '@/lib/api/adapters/server';

export async function registerNodeInstrumentation(): Promise<void> {
  await enableApiMockingServer();
}
