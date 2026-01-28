-- Add new services for updated categories
-- Craft services for Martin Tesař (worker_id: 74546061-82f5-41d8-9a1b-e00604242b6d)
UPDATE public.services SET name = 'Tesařské práce', description = 'Výroba a opravy dřevěných konstrukcí, pergoly, přístřešky' 
WHERE id = '95b5cc25-88ba-4220-876b-1667dd4dfaba';
UPDATE public.services SET name = 'Truhlářství na zakázku', description = 'Zakázková výroba nábytku, police, vestavěné skříně' 
WHERE id = '2efeaee4-ca61-4542-ad8b-1cf32fe8705f';
INSERT INTO public.services (worker_id, name, description, price, category)
VALUES ('74546061-82f5-41d8-9a1b-e00604242b6d', 'Stavba pergoly', 'Kompletní realizace dřevěné pergoly na míru', 15000, 'craft');

-- Tech services for Tomáš IT Expert (worker_id: 71f6ba5e-33c2-4c11-b39a-bb73c20b93da)
UPDATE public.services SET name = 'Nastavení Wi-Fi sítě', description = 'Instalace a konfigurace domácí Wi-Fi, mesh systémy' 
WHERE id = 'bd4eb5f8-706b-423c-9ff0-b6f72440a5c8';
UPDATE public.services SET name = 'Oprava PC/notebooku', description = 'Diagnostika, čištění, výměna komponent, reinstalace systému' 
WHERE id = 'f71ea28c-a386-4206-a284-e4ec3bd16a9d';
INSERT INTO public.services (worker_id, name, description, price, category)
VALUES ('71f6ba5e-33c2-4c11-b39a-bb73c20b93da', 'Smart domácnost', 'Instalace chytrých žárovek, kamer, termostatů', 800, 'tech');

-- Care services for Lucie Pečovatelka (worker_id: e2358e0a-0ca6-4917-9df1-90a0b9b2cedf)
UPDATE public.services SET name = 'Pomoc seniorům', description = 'Nákupy, doprovod k lékaři, společnost, drobná výpomoc' 
WHERE id = 'f09c2294-8973-4711-a091-b86ee607dc96';
UPDATE public.services SET name = 'Hlídání dětí', description = 'Spolehlivé hlídání dětí od 3 let, vyzvednutí ze školky' 
WHERE id = '007153e3-aa2d-4adb-b2c4-7f084fc9c8ac';
INSERT INTO public.services (worker_id, name, description, price, category)
VALUES ('e2358e0a-0ca6-4917-9df1-90a0b9b2cedf', 'Venčení psů', 'Pravidelné venčení psů, péče o domácí mazlíčky', 150, 'care');

-- Auto services for David Automechanik (worker_id: 15af6eea-03cd-4047-b1fe-7fe0b4326ebb)
UPDATE public.services SET name = 'Mytí auta u vás doma', description = 'Kompletní ruční mytí auta včetně leštění' 
WHERE id = '454f41aa-0cf0-4ef2-8e50-2a4413b83a10';
UPDATE public.services SET name = 'Čištění interiéru vozu', description = 'Hloubkové čištění sedaček, koberců, palubní desky' 
WHERE id = '3eaf40d8-c175-4449-b3aa-38a063a3ac66';
INSERT INTO public.services (worker_id, name, description, price, category)
VALUES ('15af6eea-03cd-4047-b1fe-7fe0b4326ebb', 'Výměna pneumatik', 'Přezutí a vyvážení pneumatik u vás doma', 600, 'auto');

-- Events services for Eva Home Staging (worker_id: bb535c30-8f07-4082-9504-30b8680c923f)
UPDATE public.services SET name = 'Home staging', description = 'Příprava bytu na prodej, profesionální aranžování' 
WHERE id = '798e711b-da35-482c-b7ee-e7e3589dcb05';
UPDATE public.services SET name = 'Vánoční výzdoba', description = 'Kompletní vánoční výzdoba domu nebo firmy' 
WHERE id = '2319ea6e-84ed-4e68-97f3-9a6ab2992231';
INSERT INTO public.services (worker_id, name, description, price, category)
VALUES ('bb535c30-8f07-4082-9504-30b8680c923f', 'Pomoc při eventech', 'Příprava prostorů, úklid po akcích', 400, 'events');

-- B2B services for Pavel Facility Manager (worker_id: 7e5079d9-6d44-41f4-a4a6-6f5332d7cbf4)
UPDATE public.services SET name = 'Facility management', description = 'Komplexní správa budov a provozoven' 
WHERE id = '3e4a3d90-d986-4719-812c-246daa5c9e4f';
UPDATE public.services SET name = 'Úklid kanceláří', description = 'Pravidelný profesionální úklid kancelářských prostor' 
WHERE id = '4fab3ec1-739c-4579-92d4-744dc713bf58';
INSERT INTO public.services (worker_id, name, description, price, category)
VALUES ('7e5079d9-6d44-41f4-a4a6-6f5332d7cbf4', 'Správa Airbnb', 'Kompletní správa krátkodobých pronájmů', 2000, 'b2b');