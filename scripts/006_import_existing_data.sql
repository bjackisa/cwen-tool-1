-- Import the existing survey data
-- This script will insert the data from the provided dataset

INSERT INTO public.survey_respondents (
  timestamp, district, sub_county, parish, age, gender, education_level, marital_status, 
  occupation, household_size, has_disability, industry_involvement, value_chain_role, 
  value_chain_stage, other_economic_activities, business_challenges, financial_challenges, 
  market_challenges, has_business_training, is_business_registered, has_financial_access, 
  current_buyers, support_services, sustainable_techniques, climate_changes_noticed, 
  climate_challenges, empowerment_programs, entrepreneurship_programs, program_organizations, 
  uses_technology, technology_types, technology_barriers, business_future_plans, 
  support_needed, group_name, respondent_name, created_at
) VALUES 
-- Sample data entries (first few from the dataset)
('2025-02-13 12:07:49', 'Mpigi', 'Buwama Town council', 'Bongole', '36', 'Female', 'Secondary', 'Cohabiting', 'Farmer', '5', false, 'Coffee', 'Farmer', 'Production', 'Dairy farming, rearing local chicken', 
 ARRAY['Limited access to finance', 'Limited market access', 'Lack of business skill'], 
 ARRAY['Lack of collateral', 'High interest rates', 'Bureaucratic processes'], 
 ARRAY['Lack of market information', 'Poor branding and packaging of products', 'Lack of Business Development services'], 
 false, false, true, ARRAY['Walk in buyers', 'Wholesalers'], ARRAY['Business training', 'Mentorship programs'], 
 ARRAY['Organic farming', 'Integrated agro-forestry'], true, ARRAY['Drought', 'Pests and diseases', 'land degradation'], 
 ARRAY['Parish Model Initiative'], false, '', true, ARRAY[], ARRAY['High cost of technology', 'Limited training on digital tools', 'Lack of knowledge about existing technologies'], 
 ARRAY['Expanding locally', 'Scaling up processing and branding', 'Diversifying into other agricultural products', 'Start other businesses to increase revenues'], 
 'Better branding and packaging', '', '', NOW()),

('2025-02-13 12:59:59', 'Mpigi', 'Mpigi Town Council', 'Park Village', '34', 'Female', 'University', 'Single', 'Entreprenuer', '3', false, 'Coffee', 'Trader', 'Retail/Trade', 'Produce trading (beans, maize)', 
 ARRAY['Limited access to finance'], ARRAY['Bureaucratic processes'], ARRAY['Poor transport means'], 
 false, true, false, ARRAY['Wholesalers'], ARRAY[], ARRAY[], true, ARRAY['Drought', 'Pests and diseases'], 
 ARRAY['None'], false, 'None', false, ARRAY[], ARRAY['Limited training on digital tools', 'Lack of knowledge about existing technologies'], 
 ARRAY['Expanding locally'], 'Capital investment', '', '', NOW()),

('2025-02-13 19:56:47', 'Mpigi', 'Buwama town council', 'Bongole', '58', 'Female', 'Primary', 'Married', 'Farmer', '10', false, 'Coffee', 'Farmer', 'Production', 'Non', 
 ARRAY['Limited access to finance', 'Lack of business skill'], 
 ARRAY['Lack of collateral', 'High interest rates', 'Bureaucratic processes', 'Fear of borrowing'], 
 ARRAY['Lack of market information', 'Poor transport means', 'Lack of Business Development services'], 
 false, false, false, ARRAY['Walk in buyers'], ARRAY['Mentorship programs'], 
 ARRAY['Organic farming', 'Mulching', 'Integrated agro-forestry'], true, ARRAY['Drought', 'Pests and diseases', 'land degradation'], 
 ARRAY['Parish Model Initiative'], false, '', false, ARRAY[], ARRAY['High cost of technology', 'Limited training on digital tools', 'Lack of knowledge about existing technologies'], 
 ARRAY['Expanding locally', 'Scaling up processing and branding', 'Diversifying into other agricultural products', 'Start other businesses to increase revenues'], 
 'Better branding and packaging', '', '', NOW());

-- Note: This is a sample of the data. The full dataset would need to be processed and inserted similarly.
-- For production, you would want to create a proper data migration script or use a CSV import tool.
