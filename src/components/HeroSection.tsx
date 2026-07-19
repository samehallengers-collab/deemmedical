import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, Truck } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";
import RequestDemoDialog from "@/components/RequestDemoDialog";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20">
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Modern medical equipment in a clinical facility"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/30" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-primary-foreground">{t("hero_badge")}</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] mb-6">
            {t("hero_title")}
          </h1>

          <p className="text-lg text-primary-foreground/70 mb-8 max-w-lg">
            {t("hero_subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => navigate("/products")}>
              {t("browse_equipment")} <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground" onClick={() => setDemoOpen(true)}>
              {t("request_demo")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { icon: Shield, label: t("iso_certified") },
              { icon: Award, label: t("expert_team") },
              { icon: Truck, label: t("nationwide_delivery") },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-accent" />
                <span className="text-sm text-primary-foreground/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <RequestDemoDialog open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
};

export default HeroSection;
