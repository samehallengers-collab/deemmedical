import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

interface EnquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnquiryDialog = ({ open, onOpenChange }: EnquiryDialogProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
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
      toast({ title: t("enquiry_submitted"), description: t("reply_soon") });
      setForm({ name: "", organization: "", email: "", phone: "", interest: "", message: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">{t("request_quote")}</DialogTitle>
          <DialogDescription>{t("dlg_enquiry_desc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="enq-name">{t("name")}</Label>
              <Input id="enq-name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("name")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enq-org">{t("organization")}</Label>
              <Input id="enq-org" maxLength={150} value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder={t("ph_hospital_clinic")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="enq-email">{t("email")}</Label>
              <Input id="enq-email" type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={t("ph_email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enq-phone">{t("phone")}</Label>
              <Input id="enq-phone" type="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("ph_phone")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enq-interest">{t("equipment_interest")}</Label>
            <Input id="enq-interest" maxLength={200} value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} placeholder={t("ph_interest")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="enq-message">{t("message")}</Label>
            <Textarea id="enq-message" maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("ph_message")} rows={3} />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? t("submitting") : t("submit_enquiry")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnquiryDialog;
