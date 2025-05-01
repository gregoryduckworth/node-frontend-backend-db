import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";
import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationType } from "../types/notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericLayout from "@/components/layouts/GenericLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
      addNotification(
        "Password reset instructions have been sent to your email",
        NotificationType.SUCCESS
      );
    } catch (error: any) {
      setIsSuccess(false);
      addNotification(
        error?.response?.data?.message || "Failed to process your request",
        NotificationType.ERROR
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAgain = () => {
    setTimeout(() => {
      setIsSuccess(false);
    }, 100);
  };

  return (
    <GenericLayout
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
    >
      <form onSubmit={handleSubmit}>
        {!isSuccess && (
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
        )}

        {!isSuccess ? (
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Reset Password"}
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full mt-6"
            onClick={handleSendAgain}
          >
            Send Again
          </Button>
        )}

        <div className="text-center text-sm mt-6">
          Remember your password?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Back to Login
          </Link>
        </div>
      </form>
    </GenericLayout>
  );
};

export default ForgotPassword;
