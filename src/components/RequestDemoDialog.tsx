import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

const ksaCities = [
  "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam",
  "Khobar", "Dhahran", "Tabuk", "Abha", "Taif",
  "Buraidah", "Najran", "Jazan", "Yanbu", "Al Ahsa",
  "Jubail", "Hail", "Khamis Mushait", "Al Qatif", "Sakaka",
];

const demoProducts = [
  "Patient Monitors", "Ultrasound Systems", "Ventilators", "Defibrillators",
  "Infusion Pumps", "ECG Machines", "Surgical Lights", "Anesthesia Machines",
];

interface RequestDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RequestDemoDialog = ({ open, onOpenChange }: RequestDemoDialogProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", hospital: "", city: "", email: "", phone: "", product: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("demo_requests").insert(formData);
    setSubmitting(false);
    if (error) {
      toast({ title: t("error"), description: t("submit_failed"), variant: "destructive" });
    } else {
      toast({ title: t("demo_submitted"), description: t("demo_soon") });
      setFormData({ name: "", hospital: "", city: "", email: "", phone: "", product: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{t("request_demo")}</DialogTitle>
          <DialogDescription>{t("dlg_demo_desc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="demo-name">{t("name")}</Label>
            <Input id="demo-name" required maxLength={100} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("full_name")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="demo-hospital">{t("hospital")}</Label>
            <Input id="demo-hospital" required maxLength={150} value={formData.hospital} onChange={(e) => setFormData({ ...formData, hospital: e.target.value })} placeholder={t("ph_org")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("city")}</Label>
            <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })} required>
              <SelectTrigger><SelectValue placeholder={t("ph_select_city")} /></SelectTrigger>
              <SelectContent>
                {ksaCities.map((city) => (<SelectItem key={city} value={city}>{city}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="demo-email">{t("email")}</Label>
              <Input id="demo-email" type="email" required maxLength={255} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t("ph_email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demo-phone">{t("phone")}</Label>
              <Input id="demo-phone" type="tel" required maxLength={20} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder={t("ph_phone")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("product")}</Label>
            <Select value={formData.product} onValueChange={(v) => setFormData({ ...formData, product: v })} required>
              <SelectTrigger><SelectValue placeholder={t("ph_select_product")} /></SelectTrigger>
              <SelectContent>
                {demoProducts.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={submitting}>
            {submitting ? t("submitting") : t("submit_request")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestDemoDialog;
