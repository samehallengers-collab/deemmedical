
-- Restrict has_role: ignore _user_id, always check the caller's roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND user_id = _user_id
      AND role = _role
  )
$$;

-- Remove broad public listing policies on storage.objects (public file URLs still work)
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Partner logos are publicly accessible" ON storage.objects;
