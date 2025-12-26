-- ===========================================
-- MULTILINGUAL CONTENT MIGRATION
-- ===========================================
-- This migration updates content tables to support multilingual fields
-- using JSONB structure: { "ar": "...", "en": "...", "fr": "..." }

-- ===========================================
-- 1. UPDATE ANNOUNCEMENTS TABLE
-- ===========================================

-- Add multilingual title column
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS title_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add multilingual description column
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS description_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add source language tracking
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS source_language text DEFAULT 'ar';

-- Migrate existing data to new structure (preserve in Arabic by default)
UPDATE public.announcements 
SET title_translations = jsonb_build_object('ar', COALESCE(title, ''), 'en', '', 'fr', ''),
    description_translations = jsonb_build_object('ar', COALESCE(description, ''), 'en', '', 'fr', '')
WHERE title_translations = '{"ar": "", "en": "", "fr": ""}'::jsonb 
  AND (title IS NOT NULL OR description IS NOT NULL);

-- ===========================================
-- 2. UPDATE ARTICLES TABLE
-- ===========================================

-- Add multilingual title column
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS title_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add multilingual excerpt column
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS excerpt_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add multilingual content column
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS content_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add source language tracking
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS source_language text DEFAULT 'ar';

-- Migrate existing data to new structure
UPDATE public.articles 
SET title_translations = jsonb_build_object('ar', COALESCE(title, ''), 'en', '', 'fr', ''),
    excerpt_translations = jsonb_build_object('ar', COALESCE(excerpt, ''), 'en', '', 'fr', ''),
    content_translations = jsonb_build_object('ar', COALESCE(content, ''), 'en', '', 'fr', '')
WHERE title_translations = '{"ar": "", "en": "", "fr": ""}'::jsonb 
  AND (title IS NOT NULL OR excerpt IS NOT NULL OR content IS NOT NULL);

-- ===========================================
-- 3. UPDATE ABSENT_TEACHERS TABLE
-- ===========================================

-- Add multilingual name column
ALTER TABLE public.absent_teachers 
ADD COLUMN IF NOT EXISTS name_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add multilingual subject column
ALTER TABLE public.absent_teachers 
ADD COLUMN IF NOT EXISTS subject_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add multilingual note column
ALTER TABLE public.absent_teachers 
ADD COLUMN IF NOT EXISTS note_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add source language tracking
ALTER TABLE public.absent_teachers 
ADD COLUMN IF NOT EXISTS source_language text DEFAULT 'ar';

-- Migrate existing data
UPDATE public.absent_teachers 
SET name_translations = jsonb_build_object('ar', COALESCE(name, ''), 'en', '', 'fr', ''),
    subject_translations = jsonb_build_object('ar', COALESCE(subject, ''), 'en', '', 'fr', ''),
    note_translations = jsonb_build_object('ar', COALESCE(note, ''), 'en', '', 'fr', '')
WHERE name_translations = '{"ar": "", "en": "", "fr": ""}'::jsonb 
  AND (name IS NOT NULL OR subject IS NOT NULL OR note IS NOT NULL);

-- ===========================================
-- 4. UPDATE CULTURAL_FACTS TABLE
-- ===========================================

-- Add multilingual title column
ALTER TABLE public.cultural_facts 
ADD COLUMN IF NOT EXISTS title_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add multilingual fact column
ALTER TABLE public.cultural_facts 
ADD COLUMN IF NOT EXISTS fact_translations jsonb DEFAULT '{"ar": "", "en": "", "fr": ""}'::jsonb;

-- Add source language tracking
ALTER TABLE public.cultural_facts 
ADD COLUMN IF NOT EXISTS source_language text DEFAULT 'ar';

-- Migrate existing data
UPDATE public.cultural_facts 
SET title_translations = jsonb_build_object('ar', COALESCE(title, ''), 'en', '', 'fr', ''),
    fact_translations = jsonb_build_object('ar', COALESCE(fact, ''), 'en', '', 'fr', '')
WHERE title_translations = '{"ar": "", "en": "", "fr": ""}'::jsonb 
  AND (title IS NOT NULL OR fact IS NOT NULL);

-- ===========================================
-- 5. HELPER FUNCTION: Get translated value
-- ===========================================
CREATE OR REPLACE FUNCTION get_translation(
    translations jsonb,
    lang text DEFAULT 'ar'
) RETURNS text AS $$
BEGIN
    -- Try requested language first
    IF translations->>lang IS NOT NULL AND translations->>lang != '' THEN
        RETURN translations->>lang;
    END IF;
    
    -- Fallback to Arabic
    IF translations->>'ar' IS NOT NULL AND translations->>'ar' != '' THEN
        RETURN translations->>'ar';
    END IF;
    
    -- Fallback to English
    IF translations->>'en' IS NOT NULL AND translations->>'en' != '' THEN
        RETURN translations->>'en';
    END IF;
    
    -- Fallback to French
    IF translations->>'fr' IS NOT NULL AND translations->>'fr' != '' THEN
        RETURN translations->>'fr';
    END IF;
    
    RETURN '';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===========================================
-- 6. INDEXES FOR BETTER PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_articles_source_language ON public.articles(source_language);
CREATE INDEX IF NOT EXISTS idx_announcements_source_language ON public.announcements(source_language);
CREATE INDEX IF NOT EXISTS idx_absent_teachers_source_language ON public.absent_teachers(source_language);

-- GIN indexes for JSONB full-text search
CREATE INDEX IF NOT EXISTS idx_articles_title_translations ON public.articles USING GIN (title_translations);
CREATE INDEX IF NOT EXISTS idx_announcements_title_translations ON public.announcements USING GIN (title_translations);
