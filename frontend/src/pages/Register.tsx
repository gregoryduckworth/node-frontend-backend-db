import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationType } from "../types/notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericLayout from "@/components/layouts/GenericLayout";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerApi(name, email, password, confirmPassword);
      addNotification(
        "Registration successful! You can now log in.",
        NotificationType.SUCCESS
      );
      navigate("/login");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Registration failed";
      addNotification(errorMessage, NotificationType.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout
      title="Create account"
      subtitle="Sign up for your Acme Inc account"
    >
      <form onSubmit={handleRegister}>
        <div className="grid gap-3">
          <Label htmlFor="name">Username</Label>
          <Input
            id="name"
            placeholder="username"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-3 mt-6">
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
        <div className="grid gap-3 mt-6">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </Button>
        <div className="text-center text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </form>
    </GenericLayout>
  );
};

export default Register;
