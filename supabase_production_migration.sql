-- StoryGrid production migration
-- Run this migration in Supabase SQL Editor. Do not run the original schema file
-- against a database that already contains production content.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('reader', 'editor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_id UUID;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS featured_image TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_alt TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_caption TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 1;

-- Preserve legacy fields and content while making new rows compatible with both mappings.
UPDATE public.posts
SET featured_image = image_url
WHERE featured_image IS NULL AND image_url IS NOT NULL;

UPDATE public.posts post
SET category_id = category.id
FROM public.categories category
WHERE post.category_id IS NULL
  AND post.category IS NOT NULL
  AND (lower(post.category) = lower(category.slug) OR lower(post.category) = lower(category.name));

DO $$
BEGIN
  UPDATE public.profiles SET role = 'reader' WHERE role IS NULL OR role NOT IN ('reader', 'editor', 'admin');
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('reader', 'editor', 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_parent_id_fkey') THEN
    ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_category_id_fkey') THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_author_id_fkey') THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey
      FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  alt_text TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display_name TEXT NOT NULL DEFAULT 'Reader',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comments_author_display_name_length CHECK (char_length(trim(author_display_name)) BETWEEN 2 AND 80),
  CONSTRAINT comments_content_length CHECK (char_length(trim(content)) BETWEEN 1 AND 2000),
  CONSTRAINT comments_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'spam'))
);

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id UUID;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comments_parent_id_fkey') THEN
    ALTER TABLE public.comments ADD CONSTRAINT comments_parent_id_fkey
      FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscribed_to_new_posts BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  subscribed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL UNIQUE REFERENCES public.posts(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider TEXT NOT NULL DEFAULT 'resend',
  recipients_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'duplicate'))
);

CREATE TABLE IF NOT EXISTS public.comment_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- The supplied production admin is linked to Auth by UUID; no frontend trust is involved.
INSERT INTO public.profiles (id, email, role)
VALUES ('17d91800-43fc-4871-aba4-8f5ff5bd6658', 'olubanjosegun818@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = 'admin', updated_at = now();

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (NEW.id, NEW.email,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''), split_part(NEW.email, '@', 1)),
    'reader')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.handle_new_profile();

CREATE OR REPLACE FUNCTION public.prevent_unauthorized_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_user NOT IN ('postgres', 'supabase_admin')
    AND COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only an administrator can change profile roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
BEFORE UPDATE ON public.profiles FOR EACH ROW
EXECUTE FUNCTION public.prevent_unauthorized_role_change();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['profiles', 'categories', 'posts', 'comments', 'comment_notification_preferences'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON public.%I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', table_name, table_name);
  END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Replace only the known StoryGrid policies so this migration can be rerun safely.
-- These helpers are SECURITY DEFINER to avoid RLS recursion while checking roles.
CREATE OR REPLACE FUNCTION public.has_staff_role()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'));
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

DO $$
DECLARE policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname IN (
        'Public can read published posts', 'Editors and admins can manage posts',
        'Public can read categories', 'Editors and admins can manage categories',
        'Authenticated users can read own profile', 'Authenticated users can update own profile',
        'Admin can manage profiles', 'Public can read approved comments',
        'Authenticated readers can insert pending comments', 'Readers can insert their own pending comments',
        'Authenticated users can update own pending comments', 'Readers can update own pending or rejected comments',
        'Authenticated users can delete own comments', 'Readers can delete own comments',
        'Admin or editor can moderate comments', 'Editors and admins can moderate comments',
        'Readers can read their own subscriber record', 'Readers can manage their own subscriber record',
        'Readers can update their own subscriber record', 'Authenticated users can manage their own newsletter subscription',
        'Anonymous users may subscribe to new posts', 'Readers can manage their own notification preferences',
        'Readers can manage own comment notification preferences', 'Editors and admins can view notification deliveries',
        'Editors and admins can manage notification deliveries', 'User can read own media',
        'Editors and admins can manage media'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  END LOOP;
END $$;

CREATE POLICY "Public can read published posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Editors and admins can manage posts" ON public.posts FOR ALL TO authenticated
USING (public.has_staff_role()) WITH CHECK (public.has_staff_role());
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Editors and admins can manage categories" ON public.categories FOR ALL TO authenticated
USING (public.has_staff_role()) WITH CHECK (public.has_staff_role());
CREATE POLICY "Authenticated users can read own profile" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.has_staff_role());
CREATE POLICY "Authenticated users can update own profile" ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.has_staff_role()) WITH CHECK (auth.uid() = id OR public.has_staff_role());
CREATE POLICY "Admin can manage profiles" ON public.profiles FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Public can read approved comments" ON public.comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Readers can insert their own pending comments" ON public.comments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "Readers can update own pending or rejected comments" ON public.comments FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND status IN ('pending', 'rejected'))
WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'rejected'));
CREATE POLICY "Readers can delete own comments" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Editors and admins can moderate comments" ON public.comments FOR UPDATE TO authenticated
USING (public.has_staff_role()) WITH CHECK (public.has_staff_role());
CREATE POLICY "Readers can manage their own subscriber record" ON public.email_subscribers FOR ALL TO authenticated
USING (user_id = auth.uid() OR lower(email) = lower(auth.email()))
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Anonymous users may subscribe to new posts" ON public.email_subscribers FOR INSERT TO anon
WITH CHECK (subscribed_to_new_posts = true AND email IS NOT NULL);
CREATE POLICY "Readers can manage own comment notification preferences" ON public.comment_notification_preferences FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Editors and admins can view notification deliveries" ON public.post_notification_deliveries FOR SELECT TO authenticated
USING (public.has_staff_role());
CREATE POLICY "Editors and admins can manage notification deliveries" ON public.post_notification_deliveries FOR ALL TO authenticated
USING (public.has_staff_role()) WITH CHECK (public.has_staff_role());
CREATE POLICY "User can read own media" ON public.media_assets FOR SELECT
USING (owner_id = auth.uid() OR public.has_staff_role());
CREATE POLICY "Editors and admins can manage media" ON public.media_assets FOR ALL TO authenticated
USING (public.has_staff_role()) WITH CHECK (public.has_staff_role());

CREATE INDEX IF NOT EXISTS posts_status_published_at_idx ON public.posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_category_status_idx ON public.posts(category_id, status, published_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_status_created_idx ON public.comments(post_id, status, created_at DESC);

-- Optional Storage setup for the existing media bucket; it does not alter stored files.
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can read StoryGrid media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can upload StoryGrid media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete StoryGrid media" ON storage.objects;
CREATE POLICY "Public can read StoryGrid media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Staff can upload StoryGrid media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media' AND public.has_staff_role());
CREATE POLICY "Staff can delete StoryGrid media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'media' AND public.has_staff_role());
