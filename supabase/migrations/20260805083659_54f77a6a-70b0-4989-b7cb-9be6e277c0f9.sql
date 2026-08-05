GRANT SELECT ON public.company_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_settings TO authenticated;
GRANT ALL ON public.company_settings TO service_role;
NOTIFY pgrst, 'reload schema';