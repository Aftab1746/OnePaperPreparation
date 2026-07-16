#!/usr/bin/env node
// Sprint 1: migrate the MVP's mock MCQs into the real `mcqs` table.
//
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-mcqs.cjs
// (or just run `npm run seed` once .env.local is filled in — see package.json)
//
// Safe to re-run: it deletes previously-seeded rows (source_type='manual' AND
// created_by is null) before inserting, so you don't get duplicates.

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const { SUBJECTS } = require("./seedData.cjs");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  console.error("Copy .env.local.example to .env.local and fill in your Supabase project's values first.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

function toRows() {
  const rows = [];
  for (const subject of SUBJECTS) {
    for (const q of subject.questions) {
      rows.push({
        question_en: q.text,
        question_ur: null,
        options_en: q.options,
        options_ur: null,
        correct_index: q.correct,
        explanation_en: q.explanation,
        explanation_ur: null,
        subject: subject.id,
        subtopic: null,
        exam_body: null,
        difficulty: q.difficulty.toLowerCase(),
        source_type: "manual",
        is_published: true,
      });
    }
  }
  return rows;
}

async function main() {
  const rows = toRows();
  console.log(`Prepared ${rows.length} MCQs from ${SUBJECTS.length} subjects.`);

  console.log("Clearing previously-seeded rows (source_type='manual', created_by is null)...");
  const { error: delErr } = await supabase
    .from("mcqs")
    .delete()
    .eq("source_type", "manual")
    .is("created_by", null);
  if (delErr) {
    console.error("Delete step failed:", delErr.message);
    process.exit(1);
  }

  console.log("Inserting seed MCQs...");
  const { data, error } = await supabase.from("mcqs").insert(rows).select("id");
  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log(`Done. Inserted ${data.length} MCQs into the mcqs table.`);
  console.log("Note: embeddings are NOT generated yet — that's Sprint 2. Search will");
  console.log("work via keyword-only full-text search (/api/search) until then.");
}

main();
