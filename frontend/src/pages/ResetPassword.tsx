import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationType } from "../types/notification";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericLayout from "@/components/layouts/GenericLayout";

const ResetPassword = () => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenParam = query.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [location]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      addNotification("Passwords don't match", NotificationType.ERROR);
      setIsSubmitting(false);
      return;
    }

    try {
      await resetPassword(token, password, confirmPassword);
      setIsSuccess(true);
      addNotification(
        "Password has been reset successfully",
        NotificationType.SUCCESS
      );
      navigate("/login");
    } catch (error: any) {
      setIsSuccess(false);
      addNotification(
        error?.response?.data?.message || "Failed to reset password",
        NotificationType.ERROR
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <Card className="w-full max-w-sm p-6">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
            <p className="text-muted-foreground">
              The password reset link is invalid or expired.
            </p>
            <Button onClick={() => navigate("/forgot-password")}>
              Request a new reset link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <GenericLayout
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit}>
        {!isSuccess && (
          <>
            <div className="grid gap-3">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid gap-3 mt-6">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {!isSuccess ? (
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Reset Password"}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full mt-6"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        )}
      </form>
    </GenericLayout>
  );
};

export default ResetPassword;
