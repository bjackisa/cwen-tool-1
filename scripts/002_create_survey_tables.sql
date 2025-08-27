-- Create main survey respondents table
CREATE TABLE IF NOT EXISTS public.survey_respondents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Location Information
  district TEXT,
  sub_county TEXT,
  parish TEXT,
  
  -- Demographics
  age TEXT,
  gender TEXT,
  education_level TEXT,
  marital_status TEXT,
  occupation TEXT,
  household_size TEXT,
  has_disability BOOLEAN DEFAULT FALSE,
  
  -- Business Information
  industry_involvement TEXT, -- Coffee/Tea
  value_chain_role TEXT, -- Farmer/Trader/Processor
  value_chain_stage TEXT, -- Production/Processing/Retail/Trade
  other_economic_activities TEXT,
  
  -- Challenges
  business_challenges TEXT[], -- Array of challenges
  financial_challenges TEXT[], -- Array of financial challenges
  market_challenges TEXT[], -- Array of market challenges
  
  -- Access and Services
  has_business_training BOOLEAN DEFAULT FALSE,
  is_business_registered BOOLEAN DEFAULT FALSE,
  has_financial_access BOOLEAN DEFAULT FALSE,
  current_buyers TEXT[],
  support_services TEXT[],
  
  -- Farming and Climate
  sustainable_techniques TEXT[],
  climate_changes_noticed BOOLEAN DEFAULT FALSE,
  climate_challenges TEXT[],
  
  -- Programs and Technology
  empowerment_programs TEXT[],
  entrepreneurship_programs TEXT[],
  program_organizations TEXT,
  uses_technology BOOLEAN DEFAULT FALSE,
  technology_types TEXT[],
  technology_barriers TEXT[],
  
  -- Future Plans
  business_future_plans TEXT[],
  support_needed TEXT,
  
  -- Contact Information
  group_name TEXT,
  respondent_name TEXT,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.survey_respondents ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to view all, but only creators can modify
CREATE POLICY "survey_respondents_select_authenticated" ON public.survey_respondents 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "survey_respondents_insert_authenticated" ON public.survey_respondents 
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "survey_respondents_update_own" ON public.survey_respondents 
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "survey_respondents_delete_own" ON public.survey_respondents 
  FOR DELETE USING (auth.uid() = created_by);
