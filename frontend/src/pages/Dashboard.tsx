import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { useAuthStore } from "../store/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTitle } from "@/hooks/use-title";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { userName } = useAuthStore();
  const { t } = useTranslation();
  useTitle("dashboard.title");

  return (
    <AuthenticatedLayout
      breadcrumbs={[
        { label: t("dashboard.title"), href: "/dashboard", current: true },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome Back: {userName}</CardTitle>
        </CardHeader>
        <CardContent>Dashboard Content</CardContent>
      </Card>
    </AuthenticatedLayout>
  );
};

export default Dashboard;
