import { Layout } from "@/components/layout/Layout";
import { UserEdit } from "@/components/users/UserEdit";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface UserEditPageProps {
  params: {
    id: string
  }
}

export default function UserEditPage({ params }: UserEditPageProps) {
  return (
    <Layout>
      <RoleGuard allowedRoles={['採用担当']}>
        <UserEdit userId={params.id} />
      </RoleGuard>
    </Layout>
  );
}
