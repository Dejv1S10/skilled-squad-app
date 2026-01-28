-- Update existing workers categories (bypass RLS with migration)
UPDATE public.workers SET categories = ARRAY['craft', 'handyman']::service_category[], 
  bio = 'Profesionální tesař a truhlář. Zakázková výroba nábytku, pergoly, terasy. 15 let zkušeností.'
WHERE id = '74546061-82f5-41d8-9a1b-e00604242b6d';

UPDATE public.workers SET categories = ARRAY['tech', 'handyman']::service_category[],
  bio = 'IT specialista - nastavení Wi-Fi, opravy PC, smart domácnost, instalace TV a satelitů.'
WHERE id = '71f6ba5e-33c2-4c11-b39a-bb73c20b93da';

UPDATE public.workers SET categories = ARRAY['care', 'cleaning']::service_category[],
  bio = 'Pečuji o seniory, pomáhám s nákupy, doprovod k lékaři. Hlídám děti i domácí mazlíčky.'
WHERE id = 'e2358e0a-0ca6-4917-9df1-90a0b9b2cedf';

UPDATE public.workers SET categories = ARRAY['auto', 'moving']::service_category[],
  bio = 'Mytí aut u vás doma, čištění interiéru, výměna pneumatik. Profesionální přístup.'
WHERE id = '15af6eea-03cd-4047-b1fe-7fe0b4326ebb';

UPDATE public.workers SET categories = ARRAY['events', 'cleaning']::service_category[],
  bio = 'Důkladný úklid domácností i kanceláří. Specializace na home staging a přípravu bytů na prodej.'
WHERE id = 'bb535c30-8f07-4082-9504-30b8680c923f';

UPDATE public.workers SET categories = ARRAY['b2b', 'moving']::service_category[],
  bio = 'Facility management, úklid kanceláří, správa nemovitostí. Spolehlivý partner pro firmy.'
WHERE id = '7e5079d9-6d44-41f4-a4a6-6f5332d7cbf4';

-- Update profile names
UPDATE public.profiles SET full_name = 'Martin Tesař' WHERE user_id = 'a3333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET full_name = 'Tomáš IT Expert' WHERE user_id = 'a4444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET full_name = 'Lucie Pečovatelka' WHERE user_id = 'a6666666-6666-6666-6666-666666666666';
UPDATE public.profiles SET full_name = 'David Automechanik' WHERE user_id = 'a8888888-8888-8888-8888-888888888888';
UPDATE public.profiles SET full_name = 'Eva Home Staging' WHERE user_id = 'a5555555-5555-5555-5555-555555555555';
UPDATE public.profiles SET full_name = 'Pavel Facility Manager' WHERE user_id = 'a7777777-7777-7777-7777-777777777777';