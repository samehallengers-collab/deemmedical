import { Wrench, Headphones, GraduationCap, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";

const ServicesSection = () => {
  const { t } = useLanguage();
  const services = [
    { icon: Wrench, title: t("svc_install_title"), description: t("svc_install_desc") },
    { icon: Headphones, title: t("svc_support_title"), description: t("svc_support_desc") },
    { icon: GraduationCap, title: t("svc_training_title"), description: t("svc_training_desc") },
    { icon: RefreshCw, title: t("svc_maintenance_title"), description: t("svc_maintenance_desc") },
  ];
  return (
    <section id="services" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold tracking-wider uppercase text-primary">{t("services_kicker")}</span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2">
            {t("services_title")}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            {t("services_subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.title} className="border-border hover:border-primary/30 transition-colors group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
