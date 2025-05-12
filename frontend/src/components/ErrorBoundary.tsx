import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from "react-error-boundary";

function ErrorFallback({ error }: FallbackProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle>{t("errorBoundary.title")}</CardTitle>
          <CardDescription>
            {t("errorBoundary.description", { error: error.message })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-sm mb-4">{error.message}</div>
          <Button onClick={() => window.location.reload()} className="w-full">
            {t("errorBoundary.reload")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorBoundary({ children }: React.PropsWithChildren<{}>) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
