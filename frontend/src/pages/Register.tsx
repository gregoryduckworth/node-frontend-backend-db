import { useState, FormEvent, useEffect } from "react";
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
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();

  // Validate password when it changes
  useEffect(() => {
    if (passwordTouched) {
      validatePassword(password);
    }
  }, [password, passwordTouched]);

  const validatePassword = (password: string): boolean => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one capital letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate password before submitting
    const isPasswordValid = validatePassword(password);
    setPasswordTouched(true);

    if (!isPasswordValid) {
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      addNotification("Passwords don't match", NotificationType.ERROR);
      return;
    }

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
            onBlur={() => setPasswordTouched(true)}
            className={
              passwordTouched && passwordErrors.length > 0
                ? "border-red-500"
                : ""
            }
          />
          {passwordTouched && passwordErrors.length > 0 && (
            <div className="text-red-500 text-sm mt-1">
              <ul className="list-disc pl-5">
                {passwordErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            Password must be at least 8 characters and include a capital letter
            and a number.
          </div>
        </div>
        <div className="grid gap-3 mt-6">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={
              password !== confirmPassword && confirmPassword
                ? "border-red-500"
                : ""
            }
          />
          {password !== confirmPassword && confirmPassword && (
            <div className="text-red-500 text-sm mt-1">
              Passwords don't match
            </div>
          )}
        </div>
        <Button
          type="submit"
          className="w-full mt-6"
          disabled={
            isSubmitting ||
            passwordErrors.length > 0 ||
            password !== confirmPassword
          }
        >
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
