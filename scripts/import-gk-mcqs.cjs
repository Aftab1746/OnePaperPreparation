#!/usr/bin/env node
// Bulk-imports MCQs extracted from a source PDF/document into the real
// `mcqs` table. Safe to re-run: skips any question that's already in the
// database (matched by exact question text), so running this twice never
// creates duplicates.
//
// Usage:
//   node scripts/import-gk-mcqs.cjs
// (needs .env.local filled in, same as scripts/seed-mcqs.cjs)

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const data = require("./gk-mcqs-data.json");

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
  const { data: existing, error: fetchErr } = await supabase.from("mcqs").select("question_en");
  if (fetchErr) {
    console.error("Failed to check existing questions:", fetchErr.message);
    process.exit(1);
  }
  const existingSet = new Set(existing.map((r) => r.question_en));
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
