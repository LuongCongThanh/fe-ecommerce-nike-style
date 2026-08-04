import { enableApiMockingServer } from '@repo/api-sdk/adapters/server';

export async function register(): Promise<void> {
  await enableApiMockingServer();
}
