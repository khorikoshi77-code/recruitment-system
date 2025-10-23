import { Layout } from "@/components/layout/Layout";
import { ApplicantDetail } from "@/components/applicants/ApplicantDetail";

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ApplicantDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Layout>
      <ApplicantDetail applicantId={id} />
    </Layout>
  );
}
