import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericLayout from "@/components/layouts/GenericLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
      setMessage("Password reset instructions have been sent to your email");
    } catch (error: any) {
      setIsSuccess(false);
      setMessage(
        error?.response?.data?.message || "Failed to process your request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout
      title="Forgot Password"
      subtitle="Enter your email to reset your password"
    >
      <form onSubmit={handleSubmit}>
        {message && (
          <div
            className={`text-sm text-center mb-6 ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

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
            onClick={() => setIsSuccess(false)}
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
