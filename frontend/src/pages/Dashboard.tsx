import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { useAuthStore } from "../store/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTitle } from "@/hooks/use-title";

const Dashboard = () => {
  const { userName } = useAuthStore();
  useTitle("dashboard.title");

  return (
    <AuthenticatedLayout>
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
