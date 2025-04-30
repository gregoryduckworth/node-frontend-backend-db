import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type JwtPayload = {
  name: string;
  [key: string]: any;
};

const Dashboard = () => {
  const [name, setName] = useState("");

  const { token, loading, refresh } = useAuth();

  useEffect(() => {
    if (!token && !loading) {
      refresh();
    } else if (token) {
      const decoded = jwt_decode<JwtPayload>(token);
      setName(decoded.name);
    }
  }, [token, loading, refresh]);

  return (
    <div>
      <Navbar />
      <Card className="max-w-2xl mx-auto mt-16">
        <CardHeader>
          <CardTitle>Welcome Back: {name}</CardTitle>
        </CardHeader>
        <CardContent>{/* Add dashboard content here */}</CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
