import React, { ReactNode } from 'react';
import LanguageSwitcher from '@/components/language-switcher';

type GenericLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

const GenericLayout: React.FC<GenericLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="flex min-h-screen flex-col justify-center items-center bg-background">
          <div className="mx-auto w-full max-w-md space-y-8 p-8 border rounded-lg shadow-lg bg-white dark:bg-zinc-900">
            <div className="flex flex-col items-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground text-center">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericLayout;
