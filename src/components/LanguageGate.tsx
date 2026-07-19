import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import deemLogo from "@/assets/deem-logo.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const LanguageGate = () => {
  const { t, selectLang } = useLanguage();

  useEffect(() => {
    document.documentElement.dir = "ltr";
    document.body.classList.remove("font-arabic");
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-10">
          <img
            src={deemLogo}
            alt="Deem Medical Technology"
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {t("gate_welcome")}
          </h1>
          <p className="text-muted-foreground">{t("gate_choose")}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-16 text-lg font-medium justify-center"
            onClick={() => selectLang("en")}
          >
            English
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-16 text-lg font-medium justify-center"
            onClick={() => selectLang("ar")}
          >
            العربية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageGate;
