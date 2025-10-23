import { Layout } from "@/components/layout/Layout";
import { InterviewEvaluation } from "@/components/interviews/InterviewEvaluation";

interface PageProps {
  params: {
    id: string;
  };
}

export default function InterviewEvaluatePage({ params }: PageProps) {
  return (
    <Layout>
      <InterviewEvaluation applicantId={params.id} />
    </Layout>
  );
}

