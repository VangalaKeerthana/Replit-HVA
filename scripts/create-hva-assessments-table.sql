-- Create the hva_assessments table for individual hazard records
CREATE TABLE IF NOT EXISTS public.hva_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hazard_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.hva_assessments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own assessments
DROP POLICY IF EXISTS "Users can only see their own assessments" ON public.hva_assessments;
CREATE POLICY "Users can only see their own assessments" ON public.hva_assessments
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Create policy for users to insert their own assessments
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.hva_assessments;
CREATE POLICY "Users can insert their own assessments" ON public.hva_assessments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_hva_assessments_user_id ON public.hva_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_hva_assessments_created_at ON public.hva_assessments(created_at DESC);
