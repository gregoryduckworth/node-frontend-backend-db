import React from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import i18n from "@/i18n/config";

// Define language information
interface Language {
  code: string;
  nativeName: string;
}

// Language native names map
const NATIVE_NAMES: Record<string, string> = {
  en: "English",
  es: "Español",
};

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  // Get available languages from i18n configuration
  const getAvailableLanguages = (): Language[] => {
    // Extract language codes from i18n resources
    const languageCodes = Object.keys(i18n.options.resources || {});

    return languageCodes.map((code) => ({
      code,
      // Use the native name for each language
      nativeName: NATIVE_NAMES[code] || code,
    }));
  };

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  // Get the name of the current language
  const getCurrentLanguage = (): Language => {
    const currentCode = i18n.language.split("-")[0]; // Handle cases like 'en-US'
    const languages = getAvailableLanguages();
    const currentLanguage = languages.find((lang) => lang.code === currentCode);
    return (
      currentLanguage || {
        code: currentCode,
        nativeName: NATIVE_NAMES[currentCode] || currentCode,
      }
    );
  };

  const languages = getAvailableLanguages();
  const currentLanguage = getCurrentLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Globe className="h-4 w-4 mr-2" />
          {currentLanguage.nativeName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="flex items-center justify-between"
          >
            <span>{language.nativeName}</span>
            {currentLanguage.code === language.code && (
              <Check className="h-4 w-4 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
