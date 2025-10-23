import { Layout } from "@/components/layout/Layout";
import { ApplicantDetail } from "@/components/applicants/ApplicantDetail";

interface PageProps {
  params: {
    id: string
  }
}

export default function ApplicantDetailPage({ params }: PageProps) {
  return (
    <Layout>
      <ApplicantDetail applicantId={params.id} />
    </Layout>
  );
}
