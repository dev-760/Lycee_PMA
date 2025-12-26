-- Add last_login column to users table
-- This column stores the timestamp of the user's last login

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'last_login'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN last_login timestamp with time zone;
    END IF;
END $$;

COMMENT ON COLUMN public.users.last_login IS 'Timestamp of the user''s last login';
