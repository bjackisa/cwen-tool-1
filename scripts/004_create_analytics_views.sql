-- Create useful views for analytics

-- Demographics summary view
CREATE OR REPLACE VIEW public.demographics_summary AS
SELECT 
  district,
  sub_county,
  parish,
  gender,
  education_level,
  marital_status,
  occupation,
  COUNT(*) as respondent_count,
  AVG(CASE WHEN age ~ '^[0-9]+$' THEN age::INTEGER ELSE NULL END) as avg_age
FROM public.survey_respondents 
GROUP BY district, sub_county, parish, gender, education_level, marital_status, occupation;

-- Business challenges analysis view
CREATE OR REPLACE VIEW public.business_challenges_analysis AS
SELECT 
  unnest(business_challenges) as challenge,
  COUNT(*) as frequency,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.survey_respondents), 2) as percentage
FROM public.survey_respondents 
WHERE business_challenges IS NOT NULL
GROUP BY challenge
ORDER BY frequency DESC;

-- Technology adoption view
CREATE OR REPLACE VIEW public.technology_adoption_analysis AS
SELECT 
  district,
  uses_technology,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY district), 2) as percentage_in_district
FROM public.survey_respondents 
GROUP BY district, uses_technology
ORDER BY district, uses_technology;

-- Value chain analysis view
CREATE OR REPLACE VIEW public.value_chain_analysis AS
SELECT 
  industry_involvement,
  value_chain_role,
  value_chain_stage,
  COUNT(*) as respondent_count
FROM public.survey_respondents 
WHERE industry_involvement IS NOT NULL
GROUP BY industry_involvement, value_chain_role, value_chain_stage
ORDER BY respondent_count DESC;

-- Grant select permissions on views to authenticated users
GRANT SELECT ON public.demographics_summary TO authenticated;
GRANT SELECT ON public.business_challenges_analysis TO authenticated;
GRANT SELECT ON public.technology_adoption_analysis TO authenticated;
GRANT SELECT ON public.value_chain_analysis TO authenticated;
