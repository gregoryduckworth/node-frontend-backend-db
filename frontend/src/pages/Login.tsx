import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { NotificationType } from "../types/notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GenericLayout from "@/components/layouts/GenericLayout";
import { ErrorResponse } from "@/api/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      addNotification(t("auth.loginSuccess"), NotificationType.SUCCESS);
      navigate("/dashboard");
    } catch (error: any) {
      let errorMessage = t("common.error");
      
      // Handle specific error codes from the API
      if (error && typeof error === 'object') {
        const apiError = error as ErrorResponse;
        
        if (apiError.code === 'EMAIL_NOT_REGISTERED') {
          errorMessage = t("auth.errors.emailNotRegistered");
        } else if (apiError.code === 'INVALID_CREDENTIALS') {
          errorMessage = t("auth.errors.invalidCredentials");
        } else if (apiError.statusCode === 500) {
          errorMessage = t("auth.errors.serverError");
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }
      
      addNotification(errorMessage, NotificationType.ERROR);
      
      // If the email isn't registered, suggest registration
      if (error?.code === 'EMAIL_NOT_REGISTERED') {
        // Add a short delay to show the error message first
        setTimeout(() => {
          addNotification(t("auth.register"), NotificationType.INFO);
        }, 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GenericLayout title={t("auth.login")} subtitle={t("app.description")}>
      <form onSubmit={handleLogin}>
        <div className="grid gap-3">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-3 mt-4">
          <Label htmlFor="password">{t("auth.password")}</Label>
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
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>
        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("auth.login")}
        </Button>
        <div className="text-center text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline underline-offset-4">
            {t("auth.register")}
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
