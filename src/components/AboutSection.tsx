import { CheckCircle, Eye, Target, Heart, Users, Shield, Sparkles, HandHeart } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();
  const stats = [
    { value: "100%", label: t("stat_quality") },
    { value: "24/7", label: t("stat_support") },
  ];
  const features = [t("about_feat_1"), t("about_feat_2"), t("about_feat_3"), t("about_feat_4")];
  const values = [
    { icon: HandHeart, title: t("value_customer_oriented"), desc: t("value_customer_oriented_desc") },
    { icon: Shield, title: t("value_integrity"), desc: t("value_integrity_desc") },
    { icon: Users, title: t("value_servant_leadership"), desc: t("value_servant_leadership_desc") },
    { icon: Sparkles, title: t("value_own_it"), desc: t("value_own_it_desc") },
    { icon: Heart, title: t("value_teamwork"), desc: t("value_teamwork_desc") },
    { icon: Target, title: t("value_be_agile"), desc: t("value_be_agile_desc") },
  ];
  return (
    <section id="about" className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-sm font-semibold tracking-wider uppercase text-primary">{t("about_kicker")}</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-5">
              {t("about_title")}
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t("about_body")}
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {t("about_body_2")}
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t("about_body_3")}
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

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">
          <div className="bg-card rounded-2xl p-8 lg:p-10 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold tracking-wider uppercase text-primary">{t("vision_kicker")}</span>
            </div>
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">{t("vision_title")}</h3>
            <p className="text-muted-foreground leading-relaxed">{t("vision_body")}</p>
          </div>

          <div className="bg-card rounded-2xl p-8 lg:p-10 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-semibold tracking-wider uppercase text-accent">{t("mission_kicker")}</span>
            </div>
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">{t("mission_title")}</h3>
            <p className="text-muted-foreground leading-relaxed">{t("mission_body")}</p>
          </div>
        </div>

        {/* Values */}
        <div className="mt-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-semibold tracking-wider uppercase text-primary">{t("values_kicker")}</span>
            <h3 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-4">{t("values_title")}</h3>
            <p className="text-muted-foreground leading-relaxed">{t("values_body")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-display text-xl font-bold text-foreground mb-2">{value.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-10 max-w-3xl mx-auto leading-relaxed">
            {t("values_closing")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
