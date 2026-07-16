// Real streak + score history tracking, backed by localStorage.
// This is a client-only, no-backend way to make streaks/leaderboard genuinely
// functional for the MVP. When the real backend + database lands (Phase 1
// of the roadmap), swap these functions for API calls with the same signatures
// and nothing else in the app needs to change.

const DATES_KEY = "opp_practice_dates";
const HISTORY_KEY = "opp_quiz_history"; // [{ date: 'YYYY-MM-DD', score: number }]
const NAME_KEY = "opp_display_name";

function isBrowser() {
  return typeof window !== "undefined";
}

export function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function getDisplayName() {
  if (!isBrowser()) return "You";
  return localStorage.getItem(NAME_KEY) || "You";
}

export function setDisplayName(name) {
  if (!isBrowser()) return;
  localStorage.setItem(NAME_KEY, name);
}

/** Call this once whenever the student finishes a practice session or quiz. */
export function recordActivity(score) {
  if (!isBrowser()) return;
  const dates = JSON.parse(localStorage.getItem(DATES_KEY) || "[]");
  const t = todayStr();
  if (!dates.includes(t)) dates.push(t);
  localStorage.setItem(DATES_KEY, JSON.stringify(dates));

  if (typeof score === "number") {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    hist.push({ date: t, score });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(-100)));
  }
}

/** Consecutive-day streak counting back from today (or yesterday if today hasn't been practiced yet). */
export function getStreak() {
  if (!isBrowser()) return 0;
  const dates = new Set(JSON.parse(localStorage.getItem(DATES_KEY) || "[]"));
  let streak = 0;
  let offset = dates.has(todayStr()) ? 0 : -1; // allow streak to still show if today isn't done yet, based on yesterday
  if (offset === -1 && !dates.has(todayStr(-1))) return 0;
  while (dates.has(todayStr(offset))) {
    streak++;
    offset--;
  }
  return streak;
}

export function getHistory() {
  if (!isBrowser()) return [];
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
}

export function getAverageScore() {
  const h = getHistory();
  if (!h.length) return null;
  return Math.round(h.reduce((a, b) => a + b.score, 0) / h.length);
}

export function getBadges() {
  const streak = getStreak();
  const avg = getAverageScore();
  const badges = [];
  if (streak >= 3) badges.push({ label: "3-Day Streak", tone: "warning" });
  if (streak >= 7) badges.push({ label: "7-Day Streak", tone: "success" });
  if (streak >= 30) badges.push({ label: "30-Day Streak", tone: "gold" });
  if (avg !== null && avg >= 90) badges.push({ label: "Top Scorer", tone: "gold" });
  else if (avg !== null && avg >= 75) badges.push({ label: "Consistent Performer", tone: "success" });
  return badges;
}

export function hasPracticedToday() {
  if (!isBrowser()) return false;
  const dates = new Set(JSON.parse(localStorage.getItem(DATES_KEY) || "[]"));
  return dates.has(todayStr());
}
