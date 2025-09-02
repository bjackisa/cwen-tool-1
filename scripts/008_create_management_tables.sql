-- New tables for districts, groups, locations, industries and respondent industries

-- Districts table
CREATE TABLE IF NOT EXISTS public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- Groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  district_id UUID REFERENCES public.districts(id)
);

-- Locations table (stores sub county and parish within a district)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES public.districts(id),
  sub_county TEXT,
  parish TEXT
);

-- Industries table
CREATE TABLE IF NOT EXISTS public.industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- Respondent to Industry join table allowing many-to-many relationship
CREATE TABLE IF NOT EXISTS public.respondent_industries (
  respondent_id UUID REFERENCES public.survey_respondents(id) ON DELETE CASCADE,
  industry_id UUID REFERENCES public.industries(id) ON DELETE CASCADE,
  PRIMARY KEY (respondent_id, industry_id)
);

