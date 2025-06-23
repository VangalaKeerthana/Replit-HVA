-- Create a function to create the table if it doesn't exist
CREATE OR REPLACE FUNCTION create_hva_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.hva_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    assessment_name TEXT NOT NULL,
    assessment_data JSONB NOT NULL,
    results_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Enable RLS if not already enabled
  ALTER TABLE public.hva_assessments ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist and recreate them
  DROP POLICY IF EXISTS "Users can manage their own assessments" ON public.hva_assessments;
  
  CREATE POLICY "Users can manage their own assessments" ON public.hva_assessments
    FOR ALL USING (auth.uid() = user_id);

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_hva_assessments_user_id ON public.hva_assessments(user_id);
  CREATE INDEX IF NOT EXISTS idx_hva_assessments_created_at ON public.hva_assessments(created_at DESC);
END;
$$;
