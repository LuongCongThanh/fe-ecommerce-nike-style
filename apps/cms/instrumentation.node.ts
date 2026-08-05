import { enableApiMockingServer } from '@repo/api-sdk/adapters/server';

export async function registerNodeInstrumentation(): Promise<void> {
  await enableApiMockingServer();
}
