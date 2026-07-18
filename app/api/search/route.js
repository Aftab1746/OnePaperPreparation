import { createClient } from "../../../lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/search?q=...&subject=...&exam_body=...&difficulty=...&page=1&page_size=20
//
// Sprint 1 scope: Postgres full-text (keyword) search only.
// Sprint 2 adds pgvector semantic search and merges the two (see design doc §6).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const subject = searchParams.get("subject");
  const examBody = searchParams.get("exam_body");
  const difficulty = searchParams.get("difficulty");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(50, parseInt(searchParams.get("page_size") || "20", 10));

  if (!q) {
    return NextResponse.json({ error: "Missing required query param 'q'" }, { status: 400 });
  }

  const supabase = await createClient();
  let query = supabase
    .from("mcqs")
    .select("id, question_en, options_en, correct_index, subject, exam_body, difficulty, explanation_en, detailed_answer, related_info", { count: "exact" })
    .eq("is_published", true)
    .textSearch("question_en", q, { type: "websearch", config: "english" });

  if (subject) query = query.eq("subject", subject);
  if (examBody) query = query.eq("exam_body", examBody);
  if (difficulty) query = query.eq("difficulty", difficulty);

  const from = (page - 1) * pageSize;
  const { data, count, error } = await query.range(from, from + pageSize - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    query: q,
    total_results: count ?? data.length,
    page,
    page_size: pageSize,
    results: data.map((r) => ({
      ...r,
      answer: r.options_en?.[r.correct_index] ?? null,
      match_type: "keyword",
    })),
  });
}
