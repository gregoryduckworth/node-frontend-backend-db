import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericLayout from "@/components/layouts/GenericLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      addNotification("Successfully signed in. Welcome back!", "success");
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Login failed";
      addNotification(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout
      title="Welcome back"
      subtitle="Login to your Acme Inc account"
    >
      <form onSubmit={handleLogin}>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm underline-offset-2 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
        <div className="text-center text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </GenericLayout>
  );
};

export default Login;
