import { Layout } from "@/components/layout/Layout";
import { InterviewEvaluation } from "@/components/interviews/InterviewEvaluation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterviewEvaluatePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Layout>
      <InterviewEvaluation applicantId={id} />
    </Layout>
  );
}

