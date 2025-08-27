-- Create initial users for CWEN WGCT App
-- These users will be created directly in Supabase Auth

-- Updated to use proper Supabase auth user creation with correct passwords

-- Create TIBENKANA DENIS
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'tibedenis02@gmail.com',
  crypt('Tibenkana2050@', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "TIBENKANA DENIS"}',
  false,
  '',
  '',
  '',
  ''
);

-- Create Fathila Nanozi
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'fnanozi@gmail.com',
  crypt('Fathila2050@', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Fathila Nanozi"}',
  false,
  '',
  '',
  '',
  ''
);

-- Note: After running this script, the users should be able to login with:
-- TIBENKANA DENIS: tibedenis02@gmail.com / Tibenkana2050@
-- Fathila Nanozi: fnanozi@gmail.com / Fathila2050@
