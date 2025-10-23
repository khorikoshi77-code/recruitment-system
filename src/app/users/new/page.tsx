import { Layout } from "@/components/layout/Layout";
import { UserRegister } from "@/components/users/UserRegister";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function UserNewPage() {
  return (
    <Layout>
      <RoleGuard allowedRoles={['採用担当']}>
        <UserRegister />
      </RoleGuard>
    </Layout>
  );
}
