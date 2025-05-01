import AuthenticatedLayout from "@/components/layouts/AuthenticatedLayout";
import { useAuthStore } from "../store/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { userName } = useAuthStore();

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
