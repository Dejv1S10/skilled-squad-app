-- Add new values to the service_category enum
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'craft';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'tech';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'care';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'auto';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'events';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'b2b';