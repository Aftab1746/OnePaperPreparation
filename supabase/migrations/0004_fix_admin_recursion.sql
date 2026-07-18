-- OnePaperPreparation — fixes an infinite-recursion bug in the "is this user
-- an admin?" security rules. The original policies checked the profiles table
-- from inside a policy ON the profiles table, which Postgres detects as a
-- loop and refuses to run. The fix: a small helper function that checks admin
-- status without triggering the recursive check.
-- Run this in the Supabase SQL editor the same way as the earlier migrations.

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = uid and role = 'admin');
$$;

-- Replace the recursive policy on profiles with one that uses the helper function.
drop policy if exists "profiles are readable by admins" on profiles;
create policy "profiles are readable by admins"
  on profiles for select using (public.is_admin(auth.uid()));

-- Same fix for the other tables that had the same recursive pattern.
drop policy if exists "admins can manage all mcqs" on mcqs;
create policy "admins can manage all mcqs"
  on mcqs for all using (public.is_admin(auth.uid()));

drop policy if exists "shared documents are readable by admins" on documents;
create policy "shared documents are readable by admins"
  on documents for select using (
    visibility = 'admin_shared' and public.is_admin(auth.uid())
  );
