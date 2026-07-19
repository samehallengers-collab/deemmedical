import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

interface RequestDemoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RequestDemoDialog = ({ open, onOpenChange }: RequestDemoDialogProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [rangeId, setRangeId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "", hospital: "", city: "", email: "", phone: "", product: "",
  });

  const { data: ranges } = useQuery({
    queryKey: ["product-ranges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_ranges").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["product-range-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("product_range_assignments").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: allProducts } = useQuery({
    queryKey: ["products-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = rangeId
    ? allProducts?.filter((p) => assignments?.some((a) => a.product_id === p.id && a.product_range_id === rangeId))
    : [];

  // Only offer ranges that have at least one active product assigned
  const activeProductIds = new Set((allProducts ?? []).map((p) => p.id));
  const rangeIdsWithProducts = new Set(
    (assignments ?? [])
      .filter((a) => activeProductIds.has(a.product_id))
      .map((a) => a.product_range_id),
  );
  const availableRanges = (ranges ?? []).filter((r) => rangeIdsWithProducts.has(r.id));

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
      setRangeId("");
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
            <Label>{t("product_range")}</Label>
            <Select
              value={rangeId}
              onValueChange={(v) => {
                setRangeId(v);
                setFormData({ ...formData, product: "" });
              }}
              required
            >
              <SelectTrigger><SelectValue placeholder={t("ph_select_range") } /></SelectTrigger>
              <SelectContent>
                {availableRanges.map((r) => (<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("product")}</Label>
            <Select
              value={formData.product}
              onValueChange={(v) => setFormData({ ...formData, product: v })}
              required
              disabled={!rangeId}
            >
              <SelectTrigger><SelectValue placeholder={rangeId ? t("ph_select_product") : t("ph_select_range_first")} /></SelectTrigger>
              <SelectContent>
                {filteredProducts?.map((p) => (<SelectItem key={p.id} value={p.title}>{p.title}</SelectItem>))}
                {rangeId && filteredProducts && filteredProducts.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">{t("no_products")}</div>
                )}
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
