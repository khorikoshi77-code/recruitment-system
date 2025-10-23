import { Layout } from "@/components/layout/Layout";
import { UserList } from "@/components/users/UserList";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function UsersPage() {
  return (
    <Layout>
      <RoleGuard allowedRoles={['採用担当']}>
        <UserList />
      </RoleGuard>
    </Layout>
  );
}
