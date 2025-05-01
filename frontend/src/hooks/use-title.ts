import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export function useTitle(titleKey: string): void {
  const { t, i18n } = useTranslation();
  const previousTitleRef = useRef<string | null>(null);

  useEffect(() => {
    previousTitleRef.current = document.title;
    const pageTitle = t(titleKey, {
      defaultValue: titleKey,
    });
    const appTitle = t("app.title");
    const formattedTitle = `${appTitle} | ${pageTitle}`;
    document.title = formattedTitle;
    return () => {
      if (previousTitleRef.current) {
        document.title = previousTitleRef.current;
      }
    };
  }, [titleKey, t, i18n.language]);
}

export default useTitle;
