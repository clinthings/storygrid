-- StoryGrid community + notification + moderation foundation
-- Run after supabase_schema.sql in the Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reading_time_minutes INT DEFAULT 1;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_alt TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_caption TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ;

INSERT INTO public.categories (name, slug, description, seo_title, seo_description)
VALUES
  ('Sports', 'sports', 'Football, transfer news, fixtures, fans, and the stories shaping the game.', 'Sports | StoryGrid', 'The latest sports coverage from Nigeria and beyond.'),
  ('Football', 'football', 'The beautiful game, match analysis, teams and player stories.', 'Football | StoryGrid', 'Football news, analysis and stories from the pitch.'),
  ('Arsenal', 'arsenal', 'Arsenal analysis, transfer talking points and club stories.', 'Arsenal | StoryGrid', 'Arsenal news, fixtures and football culture.'),
  ('Premier League', 'premier-league', 'Premier League matches, form, and stories from England.', 'Premier League | StoryGrid', 'Premier League results, history and important stories.'),
  ('Nigerian Football', 'nigerian-football', 'The pulse of football across Nigeria and the diaspora.', 'Nigerian Football | StoryGrid', 'Nigerian football culture, players and stories.'),
  ('Entertainment', 'entertainment', 'Film, TV, music, celebrity culture and creative media.', 'Entertainment | StoryGrid', 'Entertainment and culture coverage for modern audiences.'),
  ('Music', 'music', 'Music releases, artists, performance and industry stories.', 'Music | StoryGrid', 'Music stories, releases and artist profiles.'),
  ('Movies', 'movies', 'Film reviews, premieres, streaming and cinema conversations.', 'Movies | StoryGrid', 'Movies, review culture and screen stories.'),
  ('Celebrity', 'celebrity', 'Celebrity life, interviews and culture coverage.', 'Celebrity | StoryGrid', 'Celebrity stories and cultural coverage.'),
  ('Technology', 'technology', 'AI, software, platforms and future-facing tools.', 'Technology | StoryGrid', 'Technology and digital culture news for the modern reader.'),
  ('Business', 'business', 'Markets, entrepreneurship and economic change.', 'Business | StoryGrid', 'Business and entrepreneurship coverage.'),
  ('Markets', 'markets', 'Markets, startup stories and sector analysis.', 'Markets | StoryGrid', 'Markets and business analysis for an informed audience.'),
  ('Lifestyle', 'lifestyle', 'Ideas, habits and everyday culture.', 'Lifestyle | StoryGrid', 'Lifestyle insights and everyday culture stories.')
ON CONFLICT (slug) DO NOTHING;

-- Reader identity is stored in public.profiles to match the canonical auth profile table.
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_display_name TEXT NOT NULL DEFAULT 'Reader' CHECK (char_length(trim(author_display_name)) BETWEEN 2 AND 80),
  content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS author_display_name TEXT;
UPDATE public.comments SET author_display_name = COALESCE(NULLIF(trim(author_display_name), ''), 'Reader') WHERE author_display_name IS NULL OR char_length(trim(author_display_name)) < 2;
ALTER TABLE public.comments ALTER COLUMN author_display_name SET DEFAULT 'Reader';
ALTER TABLE public.comments ALTER COLUMN author_display_name SET NOT NULL;

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

CREATE TABLE IF NOT EXISTS public.comment_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL UNIQUE REFERENCES public.posts(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider TEXT NOT NULL DEFAULT 'resend',
  recipients_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'duplicate'))
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved comments" ON public.comments
FOR SELECT TO anon, authenticated USING (status = 'approved');

CREATE POLICY "Readers can insert their own pending comments" ON public.comments
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Readers can update own pending or rejected comments" ON public.comments
FOR UPDATE TO authenticated USING (user_id = auth.uid() AND status IN ('pending', 'rejected')) WITH CHECK (user_id = auth.uid() AND status IN ('pending', 'rejected'));

CREATE POLICY "Readers can delete own comments" ON public.comments
FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Editors and admins can moderate comments" ON public.comments
FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor'))
);

CREATE POLICY "Authenticated users can manage their own newsletter subscription" ON public.email_subscribers
FOR ALL TO authenticated USING (user_id = auth.uid() OR lower(email) = lower(auth.email())) WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Anonymous users may subscribe to new posts" ON public.email_subscribers
FOR INSERT TO anon WITH CHECK (subscribed_to_new_posts = true AND email IS NOT NULL);

CREATE POLICY "Readers can manage own comment notification preferences" ON public.comment_notification_preferences
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Editors and admins can view notification deliveries" ON public.post_notification_deliveries
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor'))
);

CREATE POLICY "Editors and admins can manage notification deliveries" ON public.post_notification_deliveries
FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'editor'))
);
