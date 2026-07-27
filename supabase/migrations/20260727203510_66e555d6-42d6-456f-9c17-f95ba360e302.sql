CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url text,
  email text,
  phone text,
  address text,
  address_ar text,
  working_hours text,
  working_hours_ar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.company_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company settings viewable by everyone"
ON public.company_settings FOR SELECT USING (true);

CREATE POLICY "Admins can insert company settings"
ON public.company_settings FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update company settings"
ON public.company_settings FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete company settings"
ON public.company_settings FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.company_settings (email, phone, address, address_ar, working_hours, working_hours_ar)
VALUES ('info@deem-ksa.com', '', '', '', 'Sat – Thu: 8:00 AM – 6:00 PM', 'السبت – الخميس: 8:00 ص – 6:00 م');