import { createFileRoute } from '@tanstack/react-router';

import { AppearanceSection } from '@/features/settings/AppearanceSection';

export const Route = createFileRoute('/_authenticated/settings/appearance')({
  component: AppearanceSection,
});
