import { redirect } from 'next/navigation';

import { ROUTES } from '@/shared/constants/routes';

export default async function AdminRootPage({ params }: { readonly params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}${ROUTES.ADMIN.PRODUCTS}`);
}
