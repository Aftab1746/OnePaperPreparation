#!/usr/bin/env node
// Generic bulk MCQ importer. Works for any subject's JSON file.
//
// Usage:
//   node scripts/import-mcqs.cjs scripts/islamiat-mcqs-data.json
//   node scripts/import-mcqs.cjs scripts/english-mcqs-data.json
//
// Same behaviour as import-gk-mcqs.cjs: safe to re-run, skips questions
// that already exist (matched by exact question text), inserts in batches.
// Needs .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

require("dotenv").config({ path: ".env.local" });
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Usage: node scripts/import-mcqs.cjs <path-to-json-file>");
  process.exit(1);
}

const data = require(path.resolve(process.cwd(), fileArg));
if (!Array.isArray(data) || data.length === 0) {
  console.error("JSON file must be a non-empty array of MCQ rows.");
  process.exit(1);
}

// Basic sanity checks before touching the database
const REQUIRED = ["question_en", "options_en", "correct_index", "subject"];
const bad = data.findIndex(
  (r) =>
    REQUIRED.some((k) => r[k] === undefined || r[k] === null) ||
    !Array.isArray(r.options_en) ||
    r.options_en.length < 2 ||
    r.correct_index < 0 ||
    r.correct_index >= r.options_en.length
);
if (bad !== -1) {
  console.error(`Row ${bad} failed validation:`, JSON.stringify(data[bad], null, 1));
  process.exit(1);
}

// Report subject and answer-position distribution so bias is visible before import
const subjects = [...new Set(data.map((r) => r.subject))];
const dist = {};
for (const r of data) dist[r.correct_index] = (dist[r.correct_index] || 0) + 1;
console.log(`File: ${fileArg}`);
console.log(`Subjects in file: ${subjects.join(", ")}`);
console.log(`Correct-answer position distribution:`, dist);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const BATCH_SIZE = 500;

async function main() {
  console.log(`Prepared ${data.length} MCQs to import.`);

  console.log("Checking which questions already exist (to avoid duplicates)...");
  // Only fetch existing questions for the subjects in this file, paged to
  // avoid Supabase's 1000-row default cap now that the table is large.
  const existingSet = new Set();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data: page, error } = await supabase
      .from("mcqs")
      .select("question_en")
      .in("subject", subjects)
      .range(from, from + PAGE - 1);
    if (error) {
      console.error("Failed to check existing questions:", error.message);
      process.exit(1);
    }
    page.forEach((r) => existingSet.add(r.question_en));
    if (page.length < PAGE) break;
  }

  const toInsert = data.filter((r) => !existingSet.has(r.question_en));
  console.log(`${data.length - toInsert.length} already exist, skipping those.`);
  console.log(`Inserting ${toInsert.length} new MCQs in batches of ${BATCH_SIZE}...`);

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("mcqs").insert(batch);
    if (error) {
      console.error(`Batch starting at ${i} failed:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  ...${inserted} / ${toInsert.length} inserted`);
  }

  console.log(`Done. Inserted ${inserted} new MCQs into the mcqs table.`);
}

main();
