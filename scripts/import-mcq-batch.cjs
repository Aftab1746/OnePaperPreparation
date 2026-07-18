#!/usr/bin/env node
// Bulk-imports a large batch of MCQs from a JSON file into the real mcqs table.
// Sends them in smaller chunks (not all at once) since Supabase/Postgres has
// practical limits on how much a single insert can carry.
//
// Usage:
//   node scripts/import-mcq-batch.cjs scripts/data/gk_import_batch1.json

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-mcq-batch.cjs <path-to-json-file>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const CHUNK_SIZE = 500;

async function main() {
  const rows = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`Loaded ${rows.length} questions from ${filePath}`);

  // Skip any question whose exact text is already in the database, so this
  // script is safe to re-run without creating duplicates.
  console.log("Checking for already-imported duplicates...");
  const { data: existing } = await supabase.from("mcqs").select("question_en");
  const existingSet = new Set((existing || []).map((r) => r.question_en));
  const toInsert = rows.filter((r) => !existingSet.has(r.question_en));
  console.log(`${rows.length - toInsert.length} already exist, ${toInsert.length} new questions to import.`);

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase.from("mcqs").insert(chunk).select("id");
    if (error) {
      console.error(`Chunk starting at ${i} failed:`, error.message);
      process.exit(1);
    }
    inserted += data.length;
    console.log(`Imported ${inserted} / ${toInsert.length}...`);
  }

  console.log(`Done. Inserted ${inserted} new questions into the mcqs table.`);
}

main();
