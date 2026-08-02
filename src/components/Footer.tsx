import deemLogo from "@/assets/deem-logo.png";
import { useLanguage, Tr } from "@/i18n/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useLanguage();
  const { data: ranges } = useQuery({
    queryKey: ["footer-product-ranges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_ranges").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const services = [t("fs_install"), t("fs_training"), t("fs_maintenance"), t("fs_support")];
  const company = [
    { label: t("fc_about"), href: "/about" },
    { label: t("fc_cert"), href: "#about" },
    { label: t("fc_careers"), href: "#about" },
    { label: t("fc_contact"), href: "#about" },
  ];
  return (
    <footer className="bg-white text-muted-foreground py-12 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="mb-4">
              <a href="/" className="inline-block hover:opacity-90 transition-opacity">
                <img src={deemLogo} alt="Deem Medical Technology" className="h-12 sm:h-14 w-auto object-contain" />
              </a>
            </div>
            <p className="text-sm leading-relaxed">
              {t("footer_tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">{t("footer_products")}</h4>
            <ul className="space-y-2 text-sm">
              {ranges?.map((range) => (
                <li key={range.id}>
                  <Link to={`/products?range=${range.id}`} className="hover:text-foreground transition-colors">
                    <Tr>{range.name}</Tr>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">{t("footer_services")}</h4>
            <ul className="space-y-2 text-sm">
              {services.map((item) => (
                <li key={item}><a href="#services" className="hover:text-foreground transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-3">{t("footer_company")}</h4>
            <ul className="space-y-2 text-sm">
              {company.map((item) => (
                <li key={item.href + item.label}>
                  {item.href.startsWith("/") ? (
                    <Link to={item.href} className="hover:text-foreground transition-colors">{item.label}</Link>
                  ) : (
                    <a href={item.href} className="hover:text-foreground transition-colors">{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs">{t("footer_rights")}</p>
          <div className="flex gap-4 text-xs">
            <a href="#" className="hover:text-foreground transition-colors">{t("privacy")}</a>
            <a href="#" className="hover:text-foreground transition-colors">{t("terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
