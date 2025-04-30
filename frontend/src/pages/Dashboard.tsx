import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/useAuthStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const { userName } = useAuthStore();

  return (
    <div>
      <Navbar />
      <Card className="max-w-2xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Welcome Back: {userName}</CardTitle>
        </CardHeader>
        <CardContent>Dashboard Content</CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
