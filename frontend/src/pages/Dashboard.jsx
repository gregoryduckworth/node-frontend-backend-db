import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { Container, Typography } from "@mui/material";

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const [name, setName] = useState("");

  const { token, loading, refresh } = useAuth();

  useEffect(() => {
    if (!token && !loading) {
      refresh();
    } else if (token) {
      const decoded = jwt_decode(token);
      setName(decoded.name);
    }
  }, [token, loading, refresh]);

  return (
    <div>
      <Navbar />
      <Container sx={{ mt: 8 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: "medium",
            mb: 3,
          }}
        >
          Welcome Back: {name}
        </Typography>
      </Container>
    </div>
  );
};

export default Dashboard;
