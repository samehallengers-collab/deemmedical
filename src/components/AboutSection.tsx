import { CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();
  const stats = [
    { value: "100%", label: t("stat_quality") },
    { value: "24/7", label: t("stat_support") },
  ];
  const features = [t("about_feat_1"), t("about_feat_2"), t("about_feat_3"), t("about_feat_4")];
  return (
    <section id="about" className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-sm font-semibold tracking-wider uppercase text-primary">{t("about_kicker")}</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-5">
              {t("about_title")}
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t("about_body")}
            </p>
            <ul className="space-y-3">
              {features.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-6 text-center border border-border shadow-sm"
              >
                <div className="font-display text-3xl lg:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
