import { redirect } from 'next/navigation';

export default async function PartnerRequestLegacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/profile/partner-requests/${id}`);
}
