import { enableApiMockingServer } from '@/integrations/backend/adapters/server';

export async function registerNodeInstrumentation(): Promise<void> {
  await enableApiMockingServer();
}
