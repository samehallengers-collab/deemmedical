-- Run this once on the database your DEPLOYED site uses,
-- if it is a different database from the one used in Lovable.
-- Creates: banners, company_settings, vlogs (safe to re-run).

-- Shared helpers -------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Banners --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text,
  link_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Banners viewable by everyone" ON public.banners;
CREATE POLICY "Banners viewable by everyone" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert banners" ON public.banners;
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update banners" ON public.banners;
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete banners" ON public.banners;
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS update_banners_updated_at ON public.banners;
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Company settings -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_settings (
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
DROP POLICY IF EXISTS "Company settings viewable by everyone" ON public.company_settings;
CREATE POLICY "Company settings viewable by everyone" ON public.company_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert company settings" ON public.company_settings;
CREATE POLICY "Admins can insert company settings" ON public.company_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update company settings" ON public.company_settings;
CREATE POLICY "Admins can update company settings" ON public.company_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete company settings" ON public.company_settings;
CREATE POLICY "Admins can delete company settings" ON public.company_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON public.company_settings;
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Vlogs ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vlogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ar text,
  excerpt text,
  excerpt_ar text,
  body text,
  body_ar text,
  cover_image_url text,
  video_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vlogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vlogs TO authenticated;
GRANT ALL ON public.vlogs TO service_role;
ALTER TABLE public.vlogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vlogs viewable by everyone" ON public.vlogs;
CREATE POLICY "Vlogs viewable by everyone" ON public.vlogs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert vlogs" ON public.vlogs;
CREATE POLICY "Admins can insert vlogs" ON public.vlogs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update vlogs" ON public.vlogs;
CREATE POLICY "Admins can update vlogs" ON public.vlogs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete vlogs" ON public.vlogs;
CREATE POLICY "Admins can delete vlogs" ON public.vlogs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS update_vlogs_updated_at ON public.vlogs;
CREATE TRIGGER update_vlogs_updated_at BEFORE UPDATE ON public.vlogs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Refresh the API schema cache
NOTIFY pgrst, 'reload schema';
