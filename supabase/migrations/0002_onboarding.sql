-- OnePaperPreparation — adds onboarding tracking to profiles.
-- Run this in the Supabase SQL editor the same way as 0001_init.sql (once).

alter table profiles
  add column if not exists onboarding_completed boolean not null default false;
