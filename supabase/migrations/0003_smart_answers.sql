-- OnePaperPreparation — adds "smart answer" fields to mcqs, plus two real
-- example rows so you can see the feature working immediately.
-- Run this in the Supabase SQL editor the same way as the earlier migrations.

-- 1) Two new columns on mcqs:
--    detailed_answer: a longer, well-formatted answer (like the pillars-of-Islam example)
--    related_info: extra related facts shown below the answer (like the borders example)
alter table mcqs
  add column if not exists detailed_answer text,
  add column if not exists related_info text;

-- 2) Two example rows demonstrating the feature (safe to run more than once —
--    each insert is guarded by a check that it doesn't already exist).
insert into mcqs (
  question_en, options_en, correct_index, explanation_en,
  detailed_answer, related_info, subject, difficulty, source_type, is_published
)
select
  'How many pillars does Islam have?',
  array['4', '6', '5', '7'],
  2,
  'Islam has five pillars, the foundation of a Muslim''s faith and practice.',
  $ans$There are five pillars of Islam:

1. Shahadatain (شہادتین) – declaration of faith: "There is no god but Allah, Muhammad ﷺ is His Messenger"
2. Namaz (نماز) – five daily prayers
3. Zakat (زکوٰة) – obligatory charity, 2.5% of wealth above Nisab
4. Fasting / Sawm (روزہ) – during Ramadan, abstaining from food, drink, and bad deeds
5. Hajj (حج) – pilgrimage to Makkah at least once in a lifetime if able$ans$,
  null,
  'islamiat', 'easy', 'manual', true
where not exists (
  select 1 from mcqs where question_en = 'How many pillars does Islam have?'
);

insert into mcqs (
  question_en, options_en, correct_index, explanation_en,
  detailed_answer, related_info, subject, difficulty, source_type, is_published
)
select
  'What is the length of the Pakistan-India border?',
  array['1,800 KM', '2,100 KM', '2,400 KM', '1,600 KM'],
  1,
  'The Pakistan-India border, including the Line of Control, is approximately 2,100 KM long.',
  'Pakistan borders India along a 2,100 KM line in the east.',
  $rel$Pakistan's total land border with four countries & sea is 7,277 KM.
Pakistan's total land border with four countries, sea, LOC & Working Boundary is 8,340 KM.

- India (east): 2,100 KM
- Afghanistan (west/northwest): 2,611 KM
- Iran (west): 909 KM
- China (northeast): 599 KM
- Arabian Sea coastline (south): 1,058 KM$rel$,
  'pakstudy', 'medium', 'manual', true
where not exists (
  select 1 from mcqs where question_en = 'What is the length of the Pakistan-India border?'
);
