-- Populate management tables with distinct values from existing survey data

-- Insert unique districts
INSERT INTO public.districts (name)
SELECT DISTINCT sr.district
FROM public.survey_respondents sr
WHERE sr.district IS NOT NULL AND sr.district <> ''
ON CONFLICT (name) DO NOTHING;

-- Insert unique groups with district reference
INSERT INTO public.groups (name, district_id)
SELECT DISTINCT sr.group_name,
       d.id
FROM public.survey_respondents sr
LEFT JOIN public.districts d ON d.name = sr.district
WHERE sr.group_name IS NOT NULL AND sr.group_name <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.groups g WHERE g.name = sr.group_name
  );

-- Insert unique locations (district, sub county, parish)
INSERT INTO public.locations (district_id, sub_county, parish)
SELECT DISTINCT d.id, sr.sub_county, sr.parish
FROM public.survey_respondents sr
LEFT JOIN public.districts d ON d.name = sr.district
WHERE sr.sub_county IS NOT NULL AND sr.sub_county <> ''
  AND sr.parish IS NOT NULL AND sr.parish <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.locations l
    WHERE l.district_id = d.id
      AND l.sub_county = sr.sub_county
      AND l.parish = sr.parish
  );

-- Insert unique industries
INSERT INTO public.industries (name)
SELECT DISTINCT sr.industry_involvement
FROM public.survey_respondents sr
WHERE sr.industry_involvement IS NOT NULL AND sr.industry_involvement <> ''
ON CONFLICT (name) DO NOTHING;

-- Map respondents to industries
INSERT INTO public.respondent_industries (respondent_id, industry_id)
SELECT sr.id, i.id
FROM public.survey_respondents sr
JOIN public.industries i ON i.name = sr.industry_involvement
WHERE sr.industry_involvement IS NOT NULL AND sr.industry_involvement <> ''
ON CONFLICT DO NOTHING;
