import { createFileRoute } from '@tanstack/react-router';

import { NotificationsSection } from '@/features/settings/NotificationsSection';

export const Route = createFileRoute('/_authenticated/settings/notifications')({
  component: NotificationsSection,
});
