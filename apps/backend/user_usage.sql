-- User Usage table (Credits & Rate Limiting)
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INT DEFAULT 500,
  last_refill_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);

-- Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Service role policy
CREATE POLICY "Service role full access on user_usage" ON user_usage FOR ALL USING (true);

-- Function to handle new user signup (auto-create 500 credits)
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_usage (user_id, credits)
  VALUES (new.id, 500)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
