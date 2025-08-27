-- Create follow-up survey table
CREATE TABLE IF NOT EXISTS public.followup_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_respondent_id UUID NOT NULL REFERENCES public.survey_respondents(id) ON DELETE CASCADE,
  
  -- Follow-up specific fields
  visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress_since_last_visit TEXT,
  
  -- Updated Demographics (if changed)
  current_age TEXT,
  current_occupation TEXT,
  current_household_size TEXT,
  
  -- Updated Business Information
  current_industry_involvement TEXT,
  current_value_chain_role TEXT,
  current_value_chain_stage TEXT,
  new_economic_activities TEXT,
  
  -- Progress Tracking
  business_growth_status TEXT, -- Expanded/Same/Declined
  revenue_change TEXT, -- Increased/Same/Decreased
  challenges_resolved TEXT[],
  new_challenges TEXT[],
  
  -- Updated Access and Services
  current_business_training BOOLEAN DEFAULT FALSE,
  current_business_registration BOOLEAN DEFAULT FALSE,
  current_financial_access BOOLEAN DEFAULT FALSE,
  new_buyers TEXT[],
  new_support_services TEXT[],
  
  -- Technology Adoption Progress
  technology_adoption_progress TEXT,
  new_technologies_used TEXT[],
  remaining_technology_barriers TEXT[],
  
  -- Achievement of Previous Goals
  previous_goals_achieved TEXT[],
  goals_not_achieved TEXT[],
  reasons_for_unachieved_goals TEXT,
  
  -- New Future Plans
  updated_business_plans TEXT[],
  new_support_needed TEXT,
  
  -- Recommendations and Notes
  recommendations TEXT,
  additional_notes TEXT,
  
  -- Metadata
  conducted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.followup_surveys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "followup_surveys_select_authenticated" ON public.followup_surveys 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "followup_surveys_insert_authenticated" ON public.followup_surveys 
  FOR INSERT WITH CHECK (auth.uid() = conducted_by);
CREATE POLICY "followup_surveys_update_own" ON public.followup_surveys 
  FOR UPDATE USING (auth.uid() = conducted_by);
CREATE POLICY "followup_surveys_delete_own" ON public.followup_surveys 
  FOR DELETE USING (auth.uid() = conducted_by);
