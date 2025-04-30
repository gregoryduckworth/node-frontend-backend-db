import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi, refreshToken } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await loginApi(email, password);
      await refresh();
      const data = await refreshToken();
      if (data && (data as any).accessToken) {
        navigate("/dashboard");
      } else {
        setMessage("Login failed: No access token returned");
      }
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 rounded-xl shadow bg-white">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <form onSubmit={handleLogin}>
        {message && <div className="text-red-600 text-sm mb-2">{message}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-4"
        >
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        Don't have any account?{" "}
        <Link to="/register" className="text-blue-600 underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
