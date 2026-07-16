-- OnePaperPreparation — Sprint 1: Foundation
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query) once
-- per project. Safe to re-run: uses `if not exists` / `create or replace` where possible.

-- 1) Extensions ---------------------------------------------------------
create extension if not exists vector;   -- pgvector, used from Sprint 2 onward
create extension if not exists pg_trgm;  -- fuzzy/keyword search helper

-- 2) Profiles -------------------------------------------------------------
-- Supabase Auth already manages `auth.users` (email, password hash, sessions).
-- We extend it with a `profiles` row per user for app-specific fields.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Student',
  role text not null default 'user' check (role in ('user', 'admin')),
  target_exam text,
  target_post text,
  ui_language text not null default 'en' check (ui_language in ('en', 'ur')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Student'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table profiles enable row level security;

create policy "profiles are readable by their owner"
  on profiles for select using (auth.uid() = id);
create policy "profiles are readable by admins"
  on profiles for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "profiles are editable by their owner"
  on profiles for update using (auth.uid() = id);

-- 3) MCQs -------------------------------------------------------------------
create table if not exists mcqs (
  id uuid primary key default gen_random_uuid(),
  question_en text not null,
  question_ur text,
  options_en text[] not null,
  options_ur text[],
  correct_index smallint not null check (correct_index between 0 and 3),
  explanation_en text,
  explanation_ur text,
  subject text not null,
  subtopic text,
  exam_body text,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  source_type text not null default 'manual' check (source_type in ('manual', 'document')),
  source_document_id uuid,               -- FK added in Sprint 4 migration when `documents` gains data
  source_location text,
  embedding vector(1024),                -- populated starting Sprint 2
  created_by uuid references profiles (id),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists mcqs_subject_idx on mcqs (subject, exam_body, difficulty);
create index if not exists mcqs_fts_idx on mcqs
  using gin (to_tsvector('english', question_en || ' ' || coalesce(explanation_en, '')));

alter table mcqs enable row level security;

-- Published MCQs are readable by everyone (including anonymous/pre-login visitors),
-- since practice content itself isn't sensitive — only user data is.
create policy "published mcqs are publicly readable"
  on mcqs for select using (is_published = true);
create policy "admins can manage all mcqs"
  on mcqs for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 4) Documents (Sprint 4 feature, table created now so the schema is stable) ----
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id) not null,
  filename text not null,
  file_type text not null check (file_type in ('pdf', 'docx', 'txt')),
  storage_path text not null,
  visibility text not null default 'private' check (visibility in ('private', 'admin_shared')),
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'ready', 'failed')),
  page_count int,
  created_at timestamptz not null default now()
);

alter table documents enable row level security;

create policy "documents are readable by their owner"
  on documents for select using (auth.uid() = owner_id);
create policy "shared documents are readable by admins"
  on documents for select using (
    visibility = 'admin_shared'
    and exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );
create policy "owners can insert their own documents"
  on documents for insert with check (auth.uid() = owner_id);
create policy "owners can update their own documents"
  on documents for update using (auth.uid() = owner_id);

-- 5) Attempts (quiz results — powers analytics + leaderboard + streaks) --------
create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) not null,
  mcq_id uuid references mcqs (id) not null,
  chosen_index smallint,
  is_correct boolean,
  time_taken_seconds int,
  attempted_at timestamptz not null default now()
);
create index if not exists attempts_user_idx on attempts (user_id, attempted_at);

alter table attempts enable row level security;

create policy "users can read their own attempts"
  on attempts for select using (auth.uid() = user_id);
create policy "users can insert their own attempts"
  on attempts for insert with check (auth.uid() = user_id);

-- Anonymized aggregate used for the leaderboard + peer-comparison analytics
-- (only score/streak/day-count, never raw per-question answers).
create or replace view leaderboard_view as
  select
    p.id as user_id,
    p.display_name,
    round(avg(case when a.is_correct then 100.0 else 0 end)) as avg_score,
    count(distinct a.attempted_at::date) as active_days
  from profiles p
  join attempts a on a.user_id = p.id
  group by p.id, p.display_name;

-- 6) Practice days (streak tracking, server-side source of truth) -------------
create table if not exists practice_days (
  user_id uuid references profiles (id) not null,
  practice_date date not null,
  primary key (user_id, practice_date)
);

alter table practice_days enable row level security;

create policy "users can read their own practice days"
  on practice_days for select using (auth.uid() = user_id);
create policy "users can insert their own practice days"
  on practice_days for insert with check (auth.uid() = user_id);
