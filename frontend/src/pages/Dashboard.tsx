import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

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
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-4">Welcome Back: {name}</h2>
      </div>
    </div>
  );
};

export default Dashboard;
