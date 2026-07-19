import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const LanguageToggle = ({ className }: { className?: string }) => {
  const { lang, setLang } = useLanguage();
  const next = lang === "en" ? "ar" : "en";
  const label = lang === "en" ? "العربية" : "English";
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(next)}
      className={className}
      aria-label={`Switch language to ${label}`}
    >
      <Globe className="w-4 h-4 me-1.5" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

export default LanguageToggle;