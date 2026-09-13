CREATE TABLE public.vlogs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
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
  published_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vlogs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vlogs TO authenticated;
GRANT ALL ON public.vlogs TO service_role;

ALTER TABLE public.vlogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vlogs viewable by everyone" ON public.vlogs FOR SELECT USING (true);
CREATE POLICY "Admins can insert vlogs" ON public.vlogs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update vlogs" ON public.vlogs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete vlogs" ON public.vlogs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_vlogs_updated_at BEFORE UPDATE ON public.vlogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();