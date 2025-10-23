import { Layout } from "@/components/layout/Layout";
import { UserEdit } from "@/components/users/UserEdit";
import { RoleGuard } from "@/components/auth/RoleGuard";

interface UserEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { id } = await params;
  return (
    <Layout>
      <RoleGuard allowedRoles={['採用担当']}>
        <UserEdit userId={id} />
      </RoleGuard>
    </Layout>
  );
}
