import type { AppIntegration } from '@/features/apps/types';

/** Static seed — representative third-party integrations an e-commerce backoffice plausibly wires
 * up, not a real integration marketplace (no backend registry exists behind this). */
export const MOCK_APPS: AppIntegration[] = [
  { id: 'google-analytics', name: 'Google Analytics', description: 'Track storefront traffic and conversion funnels.', connected: true },
  { id: 'slack', name: 'Slack', description: 'Post new-order and low-stock alerts to a channel.', connected: true },
  { id: 'zalo-oa', name: 'Zalo OA', description: 'Send order status updates to customers via Zalo.', connected: false },
  { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm', description: 'Sync shipment tracking for delivered orders.', connected: false },
  { id: 'momo', name: 'MoMo', description: 'Accept MoMo e-wallet payments at checkout.', connected: true },
  { id: 'mailchimp', name: 'Mailchimp', description: 'Sync customer emails for marketing campaigns.', connected: false },
];
