import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const ContactSection = () => {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const contactInfo = [
    { icon: MapPin, label: lang === "ar" ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia" },
    { icon: Phone, label: "+966 XX XXX XXXX" },
    { icon: Mail, label: "info@deem-ksa.com" },
    { icon: Clock, label: lang === "ar" ? "الاثنين – الجمعة: 8:00 ص – 6:00 م" : "Mon – Fri: 8:00 AM – 6:00 PM" },
  ];
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", organization: "", email: "", phone: "", interest: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert(form);
    setSubmitting(false);
    if (error) {
      toast({ title: t("error"), description: t("submit_failed"), variant: "destructive" });
    } else {
      toast({ title: t("inquiry_submitted"), description: t("reply_soon") });
      setForm({ name: "", organization: "", email: "", phone: "", interest: "", message: "" });
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14">
          <div>
            <span className="text-sm font-semibold tracking-wider uppercase text-primary">{t("contact_kicker")}</span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-5">
              {t("contact_title")}
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              {t("contact_body")}
            </p>
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 lg:p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("full_name")}</label>
                  <Input required maxLength={100} placeholder={t("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("organization")}</label>
                  <Input maxLength={150} placeholder={t("ph_hospital_clinic")} value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("email")}</label>
                  <Input type="email" required maxLength={255} placeholder={t("ph_email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{t("phone")}</label>
                  <Input type="tel" maxLength={20} placeholder={t("ph_phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("equipment_interest")}</label>
                <Input maxLength={200} placeholder={t("ph_interest")} value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("message")}</label>
                <Textarea maxLength={1000} placeholder={t("ph_message")} rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <Button className="w-full" size="lg" type="submit" disabled={submitting}>
                {submitting ? t("submitting") : t("submit_inquiry")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
