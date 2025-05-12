import { TFunction } from "i18next";

export interface Language {
  code: string;
  nativeName: string;
}

export const getAvailableLanguages = (
  t: TFunction,
  languageCodes: string[],
): Language[] => {
  return languageCodes.map((code) => ({
    code,
    nativeName: t(`languages.${code}`),
  }));
};

export const getCurrentLanguage = (
  t: TFunction,
  currentLanguageCode: string,
  availableLanguages: Language[],
): Language => {
  const code = currentLanguageCode.includes("-")
    ? currentLanguageCode.split("-")[0]
    : currentLanguageCode;
  const currentLanguage = availableLanguages.find((lang) => lang.code === code);

  return (
    currentLanguage || {
      code,
      nativeName: t(`languages.${code}`, code),
    }
  );
};
