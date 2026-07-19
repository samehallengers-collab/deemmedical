import deemLogo from "@/assets/deem-logo.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const products = [t("fp_diagnostic"), t("fp_monitoring"), t("fp_surgical"), t("fp_lab")];
  const services = [t("fs_install"), t("fs_training"), t("fs_maintenance"), t("fs_support")];
  const company = [t("fc_about"), t("fc_cert"), t("fc_careers"), t("fc_contact")];
  return (
    <footer className="bg-primary text-primary-foreground/70 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="mb-4">
              <img src={deemLogo} alt="Deem Medical Technology" className="h-14 w-auto" />
            </div>
            <p className="text-sm leading-relaxed">
              {t("footer_tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-3">{t("footer_products")}</h4>
            <ul className="space-y-2 text-sm">
              {products.map((item) => (
                <li key={item}><a href="#products" className="hover:text-primary-foreground transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-3">{t("footer_services")}</h4>
            <ul className="space-y-2 text-sm">
              {services.map((item) => (
                <li key={item}><a href="#services" className="hover:text-primary-foreground transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-3">{t("footer_company")}</h4>
            <ul className="space-y-2 text-sm">
              {company.map((item) => (
                <li key={item}><a href="#about" className="hover:text-primary-foreground transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs">{t("footer_rights")}</p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-primary-foreground transition-colors">{t("privacy")}</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">{t("terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
