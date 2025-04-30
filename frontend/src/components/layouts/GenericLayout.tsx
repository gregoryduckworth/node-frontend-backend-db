import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type GenericLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

const GenericLayout: React.FC<GenericLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {subtitle && (
                      <p className="text-muted-foreground text-balance">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {children}
                </div>
              </div>
              <div className="bg-muted relative hidden md:block">
                <img
                  src="/vite.svg"
                  alt="Image"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1/2 w-auto max-w-[60%] object-contain dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GenericLayout;
