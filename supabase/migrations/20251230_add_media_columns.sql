-- Add images and videos columns to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS images text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT ARRAY[]::text[];

-- Update RLS policies to allow updating these columns
-- (Assuming standard policies exist, but forcing a refresh of the schema cache)
NOTIFY pgrst, 'reload schema';
