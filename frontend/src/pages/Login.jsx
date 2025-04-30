import { useState } from "react";
import { Button, TextField, Container, Typography, Box } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, refreshToken } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await loginApi(email, password);
      await refresh();
      const data = await refreshToken();
      if (data && data.accessToken) {
        navigate("/dashboard");
      } else {
        setMessage("Login failed: No access token returned");
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          boxShadow: 3,
          p: 4,
          mt: 10,
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 500,
          }}
        >
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "red",
            }}
          >
            {message}
          </Typography>
          <TextField
            required
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            required
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 3,
            }}
          >
            Login
          </Button>
        </form>

        <Typography
          sx={{
            mt: 2,
          }}
        >
          Dont have any account? <Link to="/register">Register</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
