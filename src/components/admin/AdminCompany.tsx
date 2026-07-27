import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import ImageCropInput from "./ImageCropInput";

const emptyForm = {
  email: "",
  phone: "",
  address: "",
  address_ar: "",
  working_hours: "",
  working_hours_ar: "",
};

const AdminCompany = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useCompanySettings();
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        email: settings.email || "",
        phone: settings.phone || "",
        address: settings.address || "",
        address_ar: settings.address_ar || "",
        working_hours: settings.working_hours || "",
        working_hours_ar: settings.working_hours_ar || "",
      });
    }
  }, [settings]);

  const uploadLogo = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `company/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("partner-logos").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("partner-logos").getPublicUrl(path).data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let logo_url: string | undefined;
      if (logoFile) logo_url = await uploadLogo(logoFile);
      const payload = { ...form, ...(logo_url && { logo_url }) };

      if (settings?.id) {
        const { error } = await supabase.from("company_settings").update(payload).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("company_settings").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
      setLogoFile(null);
      toast({ title: "Company details saved" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Details</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <form
            className="space-y-5 max-w-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <ImageCropInput
                aspect={1}
                value={logoFile}
                onChange={setLogoFile}
                currentUrl={settings?.logo_url || null}
                hint="Used on the contact section."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="info@deem-ksa.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+966 ..."
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Address (English)</Label>
                <Textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Address (Arabic)</Label>
                <Textarea
                  rows={2}
                  dir="rtl"
                  value={form.address_ar}
                  onChange={(e) => setForm({ ...form, address_ar: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Working hours (English)</Label>
                <Input
                  value={form.working_hours}
                  onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                  placeholder="Sat – Thu: 8:00 AM – 6:00 PM"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Working hours (Arabic)</Label>
                <Input
                  dir="rtl"
                  value={form.working_hours_ar}
                  onChange={(e) => setForm({ ...form, working_hours_ar: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save company details"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCompany;
