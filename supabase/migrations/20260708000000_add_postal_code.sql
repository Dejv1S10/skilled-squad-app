-- Přidání PSČ do profilu uživatele (nepovinné, nic nemaže ani nemění).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS postal_code TEXT;
