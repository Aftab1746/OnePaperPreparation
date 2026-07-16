"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Search, Home, LayoutDashboard, BookOpen, FileStack, Wand2, Trophy,
  BarChart3, UserCircle2, Newspaper, Bell, Menu, X, ChevronRight,
  Clock, Flag, CheckCircle2, XCircle, Globe2, LogOut, Flame, Award,
} from "lucide-react";
import {
  recordActivity, getStreak, getAverageScore, getBadges, getHistory,
  getDisplayName, setDisplayName, hasPracticedToday,
} from "../lib/streak";
import { createClient as createSupabaseClient } from "../lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  TOKENS  — deep navy + green (official exam palette), gold seal accent */
/* ------------------------------------------------------------------ */
const T = {
  navy: "#0F3D5C", navyDark: "#0A2A40", green: "#1B5E4A", gold: "#C6A15B",
  bg: "#F3F5F6", surface: "#FFFFFF", ink: "#1B222B", muted: "#5C6773",
  success: "#2F7D4F", warning: "#B8860B", danger: "#B23A32", border: "#E1E5E8",
};

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */
const SUBJECTS = [
  { id: "gk", name: "General Knowledge", short: "GK", color: "#0F3D5C", questions: [
    { id: "gk1", text: "Which mountain range separates Pakistan from China?", options: ["Hindu Kush", "Karakoram", "Sulaiman", "Himalayas"], correct: 1, difficulty: "Medium", explanation: "The Karakoram range forms the shared border area, home to K2." },
    { id: "gk2", text: "Mohenjo-daro is located in which province?", options: ["Punjab", "Sindh", "Balochistan", "KPK"], correct: 1, difficulty: "Easy", explanation: "Mohenjo-daro lies in Larkana district, Sindh." },
    { id: "gk3", text: "Which is the longest river of Pakistan?", options: ["Jhelum", "Chenab", "Indus", "Ravi"], correct: 2, difficulty: "Easy", explanation: "The Indus River runs about 3,180 km, the longest in the country." },
    { id: "gk4", text: "The Wagah Border ceremony takes place near which city?", options: ["Sialkot", "Lahore", "Multan", "Gujranwala"], correct: 1, difficulty: "Easy", explanation: "Wagah lies about 24 km from Lahore." },
  ]},
  { id: "english", name: "English", short: "ENG", color: "#1B5E4A", questions: [
    { id: "en1", text: "Choose the correctly spelled word.", options: ["Recieve", "Receive", "Receve", "Receeve"], correct: 1, difficulty: "Easy", explanation: "'i before e except after c' — Receive follows this rule." },
    { id: "en2", text: "Synonym of 'Candid':", options: ["Deceptive", "Frank", "Hidden", "Confused"], correct: 1, difficulty: "Medium", explanation: "Candid means open and honest, closest to 'Frank'." },
    { id: "en3", text: "Fill in the blank: She has been working here ___ 2019.", options: ["for", "since", "from", "at"], correct: 1, difficulty: "Medium", explanation: "'Since' pairs with a specific point in time." },
    { id: "en4", text: "Passive voice of: 'They built this bridge in 1990.'", options: ["This bridge is built in 1990.", "This bridge was built in 1990.", "This bridge built in 1990.", "This bridge has built in 1990."], correct: 1, difficulty: "Medium", explanation: "Past simple active becomes 'was/were + past participle'." },
  ]},
  { id: "urdu", name: "Urdu", short: "URD", color: "#7A4F1C", questions: [
    { id: "ur1", text: "\u0645\u062a\u0631\u0627\u062f\u0641 \u0644\u0641\u0638 \u0686\u0646\u06cc\u06ba: \u0627\u0644\u0641\u0627\u0638 \u06a9\u0627 \u0645\u062a\u0631\u0627\u062f\u0641 \u0644\u0641\u0638 \u06c1\u06d2 \u061f", options: ["\u0627\u0644\u0641\u0627\u0638", "\u0627\u0644\u0641\u0638", "\u0644\u0641\u0638\u06d2", "\u0627\u0644\u0641\u06cc\u0638"], correct: 1, difficulty: "Medium", explanation: "\u0627\u0644\u0641\u0627\u0638 \u06a9\u0627 \u0648\u0627\u062d\u062f \u0644\u0641\u0638 \u200f'\u0644\u0641\u0638' \u06c1\u06d2\u06d4" },
    { id: "ur2", text: "\u0645\u0631\u0632\u0627 \u063a\u0627\u0644\u0628 \u06a9\u0627 \u062a\u0639\u0644\u0642 \u06a9\u0633 \u0635\u0646\u0641 \u0627\u062f\u0628 \u0633\u06d2 \u06c1\u06d2\u061f", options: ["\u063a\u0632\u0644", "\u0645\u0631\u062b\u06cc\u06c1", "\u0642\u0635\u06cc\u062f\u06c1", "\u0646\u0638\u0645"], correct: 0, difficulty: "Easy", explanation: "\u0645\u0631\u0632\u0627 \u063a\u0627\u0644\u0628 \u0627\u0631\u062f\u0648 \u06a9\u06d2 \u0645\u0634\u06c1\u0648\u0631 \u062a\u0631\u06cc\u0646 \u063a\u0632\u0644 \u06af\u0648 \u06c1\u06cc\u06ba\u06d4" },
    { id: "ur3", text: "'\u0622\u0628 \u0632\u062f' \u0645\u062d\u0627\u0648\u0631\u06c1 \u06a9\u0627 \u0645\u0637\u0644\u0628 \u06c1\u06d2:", options: ["\u062c\u0644\u062f\u06cc \u0628\u0627\u0632 \u0622\u0646\u06d2 \u0648\u0627\u0644\u0627", "\u0628\u0632\u062f\u0644", "\u0633\u0633\u062a", "\u062e\u0648\u0634 \u0645\u0632\u0627\u062c"], correct: 0, difficulty: "Medium", explanation: "'\u0622\u0628 \u0632\u062f' \u06a9\u0627 \u0645\u0637\u0644\u0628 \u06c1\u06d2 \u062c\u0644\u062f \u0628\u0627\u0632 \u0622\u0646\u06d2 \u0648\u0627\u0644\u0627\u06d4" },
  ]},
  { id: "islamiat", name: "Islamic Studies", short: "ISL", color: "#14532D", questions: [
    { id: "is1", text: "How many Ashra Mubashra companions are there?", options: ["8", "10", "12", "6"], correct: 1, difficulty: "Easy", explanation: "Ten companions were given glad tidings of Paradise." },
    { id: "is2", text: "The first revelation was received in which cave?", options: ["Cave of Thawr", "Cave of Hira", "Cave of Uhud", "Cave of Badr"], correct: 1, difficulty: "Easy", explanation: "The first revelation came in the Cave of Hira." },
    { id: "is3", text: "Which Surah is known as the heart of the Quran?", options: ["Surah Yaseen", "Surah Rahman", "Surah Ikhlas", "Surah Fatiha"], correct: 0, difficulty: "Medium", explanation: "Surah Yaseen is traditionally called the heart of the Quran." },
  ]},
  { id: "pakstudy", name: "Pakistan Studies & Current Affairs", short: "PSC", color: "#8C2F39", questions: [
    { id: "ps1", text: "Pakistan became a nuclear power in which year?", options: ["1974", "1998", "2001", "1988"], correct: 1, difficulty: "Easy", explanation: "Nuclear tests were conducted at Chagai in May 1998." },
    { id: "ps2", text: "The Objectives Resolution was passed in which year?", options: ["1949", "1956", "1962", "1940"], correct: 0, difficulty: "Medium", explanation: "Passed by the Constituent Assembly in March 1949." },
    { id: "ps3", text: "Which city is known as the 'City of Gardens'?", options: ["Multan", "Lahore", "Faisalabad", "Peshawar"], correct: 1, difficulty: "Easy", explanation: "Lahore is traditionally called the City of Gardens." },
  ]},
  { id: "math", name: "Mathematics", short: "MATH", color: "#0B4F6C", questions: [
    { id: "ma1", text: "A shopkeeper sells an item for Rs. 1200 at 20% profit. Find the cost price.", options: ["Rs. 960", "Rs. 1000", "Rs. 1440", "Rs. 1100"], correct: 1, difficulty: "Medium", explanation: "CP = SP / (1 + profit%) = 1200 / 1.2 = Rs. 1000." },
    { id: "ma2", text: "What is 15% of 640?", options: ["96", "86", "106", "90"], correct: 0, difficulty: "Easy", explanation: "0.15 x 640 = 96." },
    { id: "ma3", text: "Ratio of boys to girls is 3:2, total 30 students. How many girls?", options: ["18", "12", "15", "20"], correct: 1, difficulty: "Medium", explanation: "Each part = 6, girls = 2 x 6 = 12." },
  ]},
  { id: "reasoning", name: "Analytical Reasoning", short: "REAS", color: "#4A2E5C", questions: [
    { id: "re1", text: "Find the next number: 2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], correct: 2, difficulty: "Medium", explanation: "Differences: 4,6,8,10,12 → 30+12=42." },
    { id: "re2", text: "If CAT is coded as DBU, how is DOG coded?", options: ["EPH", "EPI", "FQH", "EQH"], correct: 0, difficulty: "Hard", explanation: "Each letter shifts forward by 1: D→E, O→P, G→H." },
    { id: "re3", text: "All roses are flowers. Some flowers fade quickly. Conclusion?", options: ["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "All flowers are roses"], correct: 1, difficulty: "Hard", explanation: "Only a possibility follows, not a certainty." },
  ]},
  { id: "science", name: "Everyday Science", short: "SCI", color: "#1A6E6E", questions: [
    { id: "sc1", text: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: 2, difficulty: "Easy", explanation: "Nitrogen makes up about 78% of the atmosphere." },
    { id: "sc2", text: "The unit of electric current is:", options: ["Volt", "Watt", "Ampere", "Ohm"], correct: 2, difficulty: "Easy", explanation: "Electric current is measured in Amperes." },
    { id: "sc3", text: "Vitamin C deficiency causes which disease?", options: ["Rickets", "Scurvy", "Night blindness", "Beriberi"], correct: 1, difficulty: "Medium", explanation: "Scurvy results from a lack of Vitamin C." },
  ]},
  { id: "computer", name: "Computer & IT", short: "COMP", color: "#2B3A67", questions: [
    { id: "co1", text: "Which shortcut key copies selected text?", options: ["Ctrl + V", "Ctrl + C", "Ctrl + X", "Ctrl + Z"], correct: 1, difficulty: "Easy", explanation: "Ctrl+C copies, Ctrl+V pastes." },
    { id: "co2", text: "RAM stands for:", options: ["Random Access Memory", "Read Access Memory", "Random Allocated Memory", "Read Allocated Memory"], correct: 0, difficulty: "Easy", explanation: "RAM = Random Access Memory." },
    { id: "co3", text: "Which of these is an input device?", options: ["Monitor", "Printer", "Scanner", "Speaker"], correct: 2, difficulty: "Easy", explanation: "A scanner sends input into the computer." },
  ]},
  { id: "laws", name: "Departmental Laws", short: "LAW", color: "#5C4033", questions: [
    { id: "la1", text: "The FIA was established under which year's act?", options: ["1974", "1975", "1973", "1978"], correct: 0, difficulty: "Medium", explanation: "The FIA Act was promulgated in 1974." },
    { id: "la2", text: "FIA primarily investigates cases related to:", options: ["Traffic violations", "Federal crimes & cross-border offences", "Municipal disputes", "Local property disputes"], correct: 1, difficulty: "Medium", explanation: "FIA handles federal crimes including trafficking and cybercrime." },
  ]},
];

const EXAM_WEIGHTAGE = {
  FIA: { label: "FIA (Sub-Inspector / UDC)", weightage: { gk: 45, english: 30, math: 15, pakstudy: 5, islamiat: 5 } },
  PPSC: { label: "PPSC (General Recruitment)", weightage: { gk: 25, english: 20, urdu: 10, islamiat: 10, pakstudy: 15, math: 10, reasoning: 10 } },
  NTS: { label: "NTS (General / NAT)", weightage: { gk: 20, english: 25, math: 20, reasoning: 20, science: 15 } },
  KPPSC: { label: "KPPSC (SST General)", weightage: { english: 30, gk: 20, pakstudy: 20, islamiat: 10, computer: 10, reasoning: 10 } },
};

const PAST_PAPERS = [
  { id: "pp1", body: "FIA", post: "Sub-Inspector", year: 2025, questions: 20, duration: 15 },
  { id: "pp2", body: "PPSC", post: "Assistant Director", year: 2025, questions: 20, duration: 20 },
  { id: "pp3", body: "NTS", post: "General NAT-I", year: 2024, questions: 18, duration: 15 },
  { id: "pp4", body: "KPPSC", post: "SST General", year: 2024, questions: 20, duration: 18 },
  { id: "pp5", body: "FIA", post: "UDC", year: 2024, questions: 16, duration: 12 },
  { id: "pp6", body: "PPSC", post: "Excise Inspector", year: 2023, questions: 20, duration: 20 },
];

const LEADERBOARD = [
  { rank: 1, name: "Ayesha K.", city: "Lahore", score: 96, streak: 21 },
  { rank: 2, name: "Bilal R.", city: "Rawalpindi", score: 94, streak: 15 },
  { rank: 3, name: "Sana M.", city: "Karachi", score: 92, streak: 30 },
  { rank: 4, name: "Usman T.", city: "Peshawar", score: 90, streak: 8 },
  { rank: 5, name: "Hina F.", city: "Multan", score: 88, streak: 12 },
];

const TREND_SEED = [52, 58, 61, 67, 71, 75];

const CURRENT_AFFAIRS_PACKS = [
  { id: "ca1", month: "July 2026", count: 40, tag: "New" },
  { id: "ca2", month: "June 2026", count: 38, tag: "" },
  { id: "ca3", month: "May 2026", count: 42, tag: "" },
];

const UI_TEXT = {
  en: { dashboard: "Dashboard", practice: "Practice by Subject", pastpapers: "Past Papers", quizbuilder: "Quiz Builder", leaderboard: "Leaderboard", analytics: "Analytics", currentaffairs: "Current Affairs", profile: "Profile & Settings" },
  ur: { dashboard: "\u0688\u06cc\u0634 \u0628\u0648\u0631\u0688", practice: "\u0645\u0636\u0627\u0645\u06cc\u0646 \u06a9\u06d2 \u0644\u062d\u0627\u0638 \u0633\u06d2 \u0645\u0634\u0642", pastpapers: "\u067e\u0631\u0627\u0646\u06d2 \u067e\u06cc\u067e\u0631\u0632", quizbuilder: "\u06a9\u0648\u0626\u0632 \u0628\u0646\u0627\u0626\u06cc\u06ba", leaderboard: "\u0644\u06cc\u0688\u0631 \u0628\u0648\u0631\u0688", analytics: "\u062a\u062c\u0632\u06cc\u06c1", currentaffairs: "\u062d\u0627\u0644\u0627\u062a \u062d\u0627\u0636\u0631\u06c1", profile: "\u067e\u0631\u0648\u0641\u0627\u0626\u0644" },
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "practice", label: "Practice by Subject", icon: BookOpen },
  { id: "pastpapers", label: "Past Papers", icon: FileStack },
  { id: "quizbuilder", label: "Quiz Builder", icon: Wand2 },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "currentaffairs", label: "Current Affairs", icon: Newspaper },
  { id: "profile", label: "Profile & Settings", icon: UserCircle2 },
];

/* ------------------------------------------------------------------ */
/*  SIGNATURE ELEMENT — official "seal" progress ring, styled like     */
/*  the ink stamp on a Pakistani exam roll-number slip / admit card    */
/* ------------------------------------------------------------------ */
function ScoreSeal({ percent, size = 96, label = "" }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const color = percent >= 75 ? T.success : percent >= 50 ? T.warning : T.danger;
  const word = percent >= 75 ? "SHAANDAR" : percent >= 50 ? "MEHNAT JAARI" : "TAWAJJO DEIN";
  return (
    <div style={{ width: size, position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E7E2D6" strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={c} strokeDashoffset={c - (c * percent) / 100}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="50%" y="47%" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={size * 0.22} fontWeight="700" fill={T.ink}>{percent}%</text>
        <text x="50%" y="63%" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize={size * 0.09} fill={T.muted} letterSpacing="1">{word}</text>
      </svg>
      {label && <div style={{ fontSize: 11, color: T.muted, marginTop: 2, textAlign: "center" }}>{label}</div>}
    </div>
  );
}

function PerforatedCard({ children }) {
  return (
    <div style={{ position: "relative", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, boxShadow: "0 1px 2px rgba(15,61,92,0.06)" }}>
      <div style={{
        position: "absolute", top: -1, left: 16, right: 16, height: 1,
        backgroundImage: `radial-gradient(circle, ${T.bg} 2px, transparent 2.2px)`,
        backgroundSize: "10px 2px", backgroundRepeat: "repeat-x",
      }} />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SMALL UI PRIMITIVES                                                 */
/* ------------------------------------------------------------------ */
function Btn({ children, variant = "primary", onClick, className = "", type = "button", disabled }) {
  const base = "px-4 py-2 rounded text-sm font-medium transition-colors inline-flex items-center gap-2 justify-center disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary: { background: T.navy, color: "#fff" },
    green: { background: T.green, color: "#fff" },
    ghost: { background: "transparent", color: T.navy, border: `1px solid ${T.border}` },
    gold: { background: T.gold, color: "#2A2210" },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={base + " " + className} style={styles[variant]}>
      {children}
    </button>
  );
}

function Pill({ children, color }) {
  return <span style={{ background: color + "1A", color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.3 }}>{children}</span>;
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {eyebrow && <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: T.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{eyebrow}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: T.navyDark, margin: 0 }}>{title}</h1>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HOME (marketing landing)                                           */
/* ------------------------------------------------------------------ */
function HomePage({ onEnter }) {
  return (
    <div style={{ minHeight: "100%", background: `linear-gradient(180deg, ${T.navyDark} 0%, ${T.navy} 55%, ${T.bg} 55%)` }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "56px 24px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 34, height: 34, borderRadius: 4, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: T.navyDark }}>1</div>
          <span style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 20 }}>OnePaperPrep</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: T.gold, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
          Roll No. — Har Aspirant, Ek Manzil
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px,5vw,52px)", color: "#fff", lineHeight: 1.15, maxWidth: 700, margin: "0 0 18px" }}>
          One syllabus weightage. One quiz builder. Every "One Paper" test — PPSC, FPSC, NTS, FIA, KPPSC.
        </h1>
        <p style={{ color: "#D9E2E8", fontSize: 16, maxWidth: 560, lineHeight: 1.6, marginBottom: 28 }}>
          Practice subject-wise, attempt real past papers, and build a quiz that mirrors the exact official weightage of your target test — then see precisely which subject is costing you marks.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn variant="gold" onClick={() => onEnter("signup")}>Create free account <ChevronRight size={16} /></Btn>
          <Btn variant="ghost" onClick={() => onEnter("login")} className="!text-white !border-white/30">I already have an account</Btn>
        </div>

        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
          {[
            { icon: Wand2, t: "Syllabus-weighted Quiz Builder", d: "Auto-generate a quiz that mirrors FIA / PPSC / NTS / KPPSC weightage exactly." },
            { icon: BarChart3, t: "Subject strength meter", d: "Green / yellow / red indicators show exactly where to focus this week." },
            { icon: FileStack, t: "Real past papers", d: "Timed, exam-mode attempts of previous FIA, PPSC and NTS papers." },
            { icon: Trophy, t: "Leaderboard & streaks", d: "Weekly rankings and daily-practice streaks keep momentum going." },
          ].map((f, i) => (
            <PerforatedCard key={i}>
              <div style={{ padding: 18 }}>
                <f.icon size={20} color={T.navy} />
                <div style={{ fontWeight: 700, color: T.navyDark, marginTop: 10, marginBottom: 4, fontSize: 14 }}>{f.t}</div>
                <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}>{f.d}</div>
              </div>
            </PerforatedCard>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AUTH                                                                */
/* ------------------------------------------------------------------ */
function AuthPage({ mode, setMode, onAuthed, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createSupabaseClient();
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password, options: { data: { display_name: name } },
        });
        if (signUpError) throw signUpError;
        // If email confirmations are enabled on the Supabase project, there's no
        // session yet — tell the user to check their inbox instead of entering the app.
        if (!data.session) {
          setError("Account created — check your email to confirm, then log in.");
          setMode("login");
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      onAuthed();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100%", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 380 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.muted, fontSize: 13, marginBottom: 16, cursor: "pointer" }}>&larr; Back to home</button>
        <PerforatedCard>
          <div style={{ padding: 28 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: T.navyDark, marginBottom: 4 }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
              {mode === "login" ? "Log in to continue your prep." : "Start tracking your weak subjects today."}
            </div>
            {error && (
              <div style={{ marginBottom: 14, padding: 10, background: "#FBEAE8", color: T.danger, fontSize: 12.5, borderRadius: 4 }}>{error}</div>
            )}
            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: T.muted }}>Full name</label>
                  <input required placeholder="e.g. Ahmed Raza" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: T.muted }}>Email</label>
                <input required type="email" placeholder="you@example.com" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: T.muted }}>Password</label>
                <input required type="password" minLength={6} placeholder="••••••••" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Btn type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
              </Btn>
            </form>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12.5, color: T.muted }}>
              {mode === "login" ? (
                <>New here? <button onClick={() => setMode("signup")} style={linkBtn}>Create an account</button></>
              ) : (
                <>Already registered? <button onClick={() => setMode("login")} style={linkBtn}>Log in</button></>
              )}
            </div>
          </div>
        </PerforatedCard>
      </div>
    </div>
  );
}
const inputStyle = { width: "100%", padding: "9px 10px", border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13.5, marginTop: 4, outline: "none", boxSizing: "border-box" };
const linkBtn = { background: "none", border: "none", color: T.navy, fontWeight: 600, cursor: "pointer", padding: 0, fontSize: 12.5 };

/* ------------------------------------------------------------------ */
/*  DASHBOARD                                                           */
/* ------------------------------------------------------------------ */
function Dashboard({ profile, subjectStrength, weakest, goPage, streak, practicedToday }) {
  return (
    <div>
      <SectionTitle eyebrow="Roll No. 2026-OPP-4471" title={`Assalam-o-Alaikum, ${profile.name.split(" ")[0]}`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16, marginBottom: 24 }}>
        <PerforatedCard>
          <div style={{ padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
            <ScoreSeal percent={subjectStrength.reduce((a, s) => a + s.percent, 0) / subjectStrength.length | 0} size={84} />
            <div>
              <div style={{ fontSize: 12, color: T.muted }}>Overall average score</div>
              <div style={{ fontSize: 13, color: T.ink, marginTop: 4 }}>Target: <b>{profile.targetExam}</b></div>
              <div style={{ fontSize: 13, color: T.ink }}>Post: <b>{profile.targetDept}</b></div>
            </div>
          </div>
        </PerforatedCard>
        <PerforatedCard>
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.danger, fontWeight: 700, fontSize: 13 }}>
              <Flag size={15} /> Today's weak subject
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginTop: 8 }}>{weakest.name}</div>
            <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 12 }}>Currently at {weakest.percent}% — needs attention this week.</div>
            <Btn variant="green" onClick={() => goPage("practice", weakest.id)}>Practice now <ChevronRight size={14} /></Btn>
          </div>
        </PerforatedCard>
        <PerforatedCard>
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.gold, fontWeight: 700, fontSize: 13 }}>
              <Flame size={15} /> Study streak
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginTop: 8 }}>{streak} {streak === 1 ? "day" : "days"}</div>
            <div style={{ fontSize: 12.5, color: practicedToday ? T.success : T.muted }}>
              {practicedToday ? "Nicely done \u2014 you've practiced today." : "Complete one quiz today to keep your streak alive."}
            </div>
          </div>
        </PerforatedCard>
      </div>

      <PerforatedCard>
        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, color: T.navyDark, marginBottom: 14, fontSize: 14 }}>Subject-wise strength</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {subjectStrength.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 150, fontSize: 12.5, color: T.ink }}>{s.name}</div>
                <div style={{ flex: 1, height: 8, background: "#EEF1F2", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${s.percent}%`, height: "100%", background: s.percent >= 75 ? T.success : s.percent >= 50 ? T.warning : T.danger }} />
                </div>
                <div style={{ width: 70, textAlign: "right" }}><Pill color={s.percent >= 75 ? T.success : s.percent >= 50 ? T.warning : T.danger}>{s.percent}% {s.percent >= 75 ? "Strong" : s.percent >= 50 ? "Fair" : "Weak"}</Pill></div>
              </div>
            ))}
          </div>
        </div>
      </PerforatedCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PRACTICE BY SUBJECT                                                 */
/* ------------------------------------------------------------------ */
function Practice({ initialSubject, bookmarks, toggleBookmark }) {
  const [subjectId, setSubjectId] = useState(initialSubject || SUBJECTS[0].id);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [difficulty, setDifficulty] = useState("All");
  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const pool = subject.questions.filter((q) => difficulty === "All" || q.difficulty === difficulty);
  const q = pool[qIdx % pool.length];

  useEffect(() => { setQIdx(0); setSelected(null); }, [subjectId, difficulty]);

  return (
    <div>
      <SectionTitle eyebrow="Practice" title="Practice by Subject" />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <div>
          {SUBJECTS.map((s) => (
            <button key={s.id} onClick={() => setSubjectId(s.id)} style={{
              display: "block", width: "100%", textAlign: "left", padding: "9px 12px", marginBottom: 6, borderRadius: 4,
              border: `1px solid ${subjectId === s.id ? s.color : T.border}`, background: subjectId === s.id ? s.color + "12" : "#fff",
              cursor: "pointer", fontSize: 13, color: subjectId === s.id ? s.color : T.ink, fontWeight: subjectId === s.id ? 700 : 400,
            }}>
              {s.name}
            </button>
          ))}
        </div>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["All", "Easy", "Medium", "Hard"].map((d) => (
              <button key={d} onClick={() => setDifficulty(d)} style={{
                fontSize: 11.5, padding: "4px 10px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${difficulty === d ? T.navy : T.border}`,
                background: difficulty === d ? T.navy : "#fff", color: difficulty === d ? "#fff" : T.muted,
              }}>{d}</button>
            ))}
          </div>
          <PerforatedCard>
            <div style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Pill color={subject.color}>{subject.short} · {q.difficulty}</Pill>
                <button onClick={() => toggleBookmark(q.id)} title="Bookmark" style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <Flag size={17} color={bookmarks.has(q.id) ? T.gold : "#C7CDD2"} fill={bookmarks.has(q.id) ? T.gold : "none"} />
                </button>
              </div>
              <div style={{ fontSize: 16, margin: "14px 0 18px", color: T.ink, lineHeight: 1.5 }}>{q.text}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {q.options.map((opt, i) => {
                  let bg = "#fff", bd = T.border;
                  if (selected !== null) {
                    if (i === q.correct) { bg = "#EAF6EE"; bd = T.success; }
                    else if (i === selected) { bg = "#FBEAE8"; bd = T.danger; }
                  }
                  return (
                    <button key={i} onClick={() => selected === null && setSelected(i)} style={{
                      textAlign: "left", padding: "10px 12px", borderRadius: 4, border: `1px solid ${bd}`, background: bg,
                      cursor: selected === null ? "pointer" : "default", fontSize: 13.5, display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      {opt}
                      {selected !== null && i === q.correct && <CheckCircle2 size={16} color={T.success} />}
                      {selected !== null && i === selected && i !== q.correct && <XCircle size={16} color={T.danger} />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <div style={{ marginTop: 14, padding: 12, background: "#F5F7F5", borderRadius: 4, fontSize: 12.5, color: T.muted }}>
                  <b style={{ color: T.ink }}>Explanation: </b>{q.explanation}
                </div>
              )}
              <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
                <Btn onClick={() => { setSelected(null); setQIdx((v) => v + 1); }}>Next question <ChevronRight size={14} /></Btn>
              </div>
            </div>
          </PerforatedCard>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAST PAPERS                                                         */
/* ------------------------------------------------------------------ */
function PastPapers({ onAttempt }) {
  const [body, setBody] = useState("All");
  const bodies = ["All", ...new Set(PAST_PAPERS.map((p) => p.body))];
  const rows = PAST_PAPERS.filter((p) => body === "All" || p.body === body);
  return (
    <div>
      <SectionTitle eyebrow="Archive" title="Past Papers">
        <select value={body} onChange={(e) => setBody(e.target.value)} style={{ ...inputStyle, width: "auto", marginTop: 0 }}>
          {bodies.map((b) => <option key={b}>{b}</option>)}
        </select>
      </SectionTitle>
      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((p) => (
          <PerforatedCard key={p.id}>
            <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.navyDark }}>{p.body} — {p.post}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{p.year} &middot; {p.questions} MCQs &middot; {p.duration} min &middot; Timed exam mode</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="ghost">Download PDF</Btn>
                <Btn onClick={() => onAttempt(p)}>Attempt now</Btn>
              </div>
            </div>
          </PerforatedCard>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QUIZ BUILDER                                                        */
/* ------------------------------------------------------------------ */
function QuizBuilder({ onStart }) {
  const [examBody, setExamBody] = useState("FIA");
  const [mode, setMode] = useState("auto");
  const [totalQ, setTotalQ] = useState(20);
  const [timer, setTimer] = useState(15);
  const [negMark, setNegMark] = useState(false);
  const [manualPct, setManualPct] = useState(EXAM_WEIGHTAGE.FIA.weightage);

  const exam = EXAM_WEIGHTAGE[examBody];
  useEffect(() => setManualPct(exam.weightage), [examBody]);
  const manualSum = Object.values(manualPct).reduce((a, b) => a + Number(b || 0), 0);

  return (
    <div>
      <SectionTitle eyebrow="Highest priority feature" title="Quiz Builder — Syllabus Weighted" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
        <PerforatedCard>
          <div style={{ padding: 22 }}>
            <label style={{ fontSize: 12, color: T.muted }}>Target test</label>
            <select value={examBody} onChange={(e) => setExamBody(e.target.value)} style={inputStyle}>
              {Object.entries(EXAM_WEIGHTAGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>

            <div style={{ marginTop: 18, marginBottom: 8, fontSize: 13, fontWeight: 700, color: T.navyDark }}>Official syllabus weightage</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {Object.entries(exam.weightage).map(([subId, pct]) => {
                const s = SUBJECTS.find((x) => x.id === subId);
                return (
                  <div key={subId} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 150, fontSize: 12.5 }}>{s?.name}</div>
                    <div style={{ flex: 1, height: 8, background: "#EEF1F2", borderRadius: 4 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: s?.color, borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 34, fontSize: 12, textAlign: "right" }}>{pct}%</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setMode("auto")} style={tabBtn(mode === "auto")}>Auto (match weightage exactly)</button>
              <button onClick={() => setMode("manual")} style={tabBtn(mode === "manual")}>Manual %-split</button>
            </div>

            {mode === "manual" && (
              <div style={{ marginBottom: 16 }}>
                {Object.keys(exam.weightage).map((subId) => {
                  const s = SUBJECTS.find((x) => x.id === subId);
                  return (
                    <div key={subId} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <div style={{ width: 150, fontSize: 12.5 }}>{s?.name}</div>
                      <input type="number" min={0} max={100} value={manualPct[subId]}
                        onChange={(e) => setManualPct((p) => ({ ...p, [subId]: e.target.value }))}
                        style={{ ...inputStyle, width: 70, marginTop: 0 }} />
                      <span style={{ fontSize: 12 }}>%</span>
                    </div>
                  );
                })}
                <div style={{ fontSize: 11.5, color: manualSum === 100 ? T.success : T.danger, marginTop: 4 }}>
                  Total: {manualSum}% {manualSum !== 100 && "(must equal 100%)"}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: T.muted }}>Number of questions</label>
                <input type="number" min={5} max={100} value={totalQ} onChange={(e) => setTotalQ(Number(e.target.value))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: T.muted }}>Timer (minutes)</label>
                <input type="number" min={5} max={180} value={timer} onChange={(e) => setTimer(Number(e.target.value))} style={inputStyle} />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 20 }}>
              <input type="checkbox" checked={negMark} onChange={(e) => setNegMark(e.target.checked)} /> Enable negative marking
            </label>
            <Btn variant="green" disabled={mode === "manual" && manualSum !== 100}
              onClick={() => onStart({ examBody, weightage: mode === "manual" ? manualPct : exam.weightage, totalQ, timer, negMark })}>
              Generate & start quiz <ChevronRight size={15} />
            </Btn>
          </div>
        </PerforatedCard>
        <PerforatedCard>
          <div style={{ padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.navyDark, marginBottom: 10 }}>Why weightage matters</div>
            <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
              Each test body allots marks differently. {exam.label} leans heavily on {SUBJECTS.find(s => s.id === Object.entries(exam.weightage).sort((a,b)=>b[1]-a[1])[0][0])?.name}, so a quiz that mirrors it exactly gives a far more realistic practice signal than a generic mixed set.
            </p>
          </div>
        </PerforatedCard>
      </div>
    </div>
  );
}
function tabBtn(active) {
  return { fontSize: 12.5, padding: "7px 12px", borderRadius: 4, cursor: "pointer", border: `1px solid ${active ? T.navy : T.border}`, background: active ? T.navy : "#fff", color: active ? "#fff" : T.ink };
}

/* ------------------------------------------------------------------ */
/*  QUIZ RUNNER + RESULT                                                */
/* ------------------------------------------------------------------ */
function buildQuizQuestions(config) {
  const list = [];
  const entries = Object.entries(config.weightage);
  entries.forEach(([subId, pct]) => {
    const subject = SUBJECTS.find((s) => s.id === subId);
    if (!subject) return;
    const count = Math.max(1, Math.round((Number(pct) / 100) * config.totalQ));
    for (let i = 0; i < count; i++) {
      const q = subject.questions[i % subject.questions.length];
      list.push({ ...q, subjectId: subId, subjectName: subject.name, uid: `${q.id}-${i}` });
    }
  });
  return list.slice(0, config.totalQ);
}

function QuizRunner({ config, onFinish }) {
  const questions = useMemo(() => buildQuizQuestions(config), [config]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(config.timer * 60);

  useEffect(() => {
    if (secondsLeft <= 0) { onFinish(questions, answers); return; }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const q = questions[idx];
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: T.muted }}>Question {idx + 1} of {questions.length} &middot; {q.subjectName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'IBM Plex Mono', monospace", color: secondsLeft < 60 ? T.danger : T.navyDark, fontWeight: 700 }}>
          <Clock size={15} /> {mm}:{ss}
        </div>
      </div>
      <PerforatedCard>
        <div style={{ padding: 22 }}>
          <div style={{ fontSize: 16, marginBottom: 16, lineHeight: 1.5 }}>{q.text}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => setAnswers((a) => ({ ...a, [q.uid]: i }))} style={{
                textAlign: "left", padding: "10px 12px", borderRadius: 4, fontSize: 13.5, cursor: "pointer",
                border: `1px solid ${answers[q.uid] === i ? T.navy : T.border}`, background: answers[q.uid] === i ? T.navy + "10" : "#fff",
              }}>{opt}</button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Btn variant="ghost" disabled={idx === 0} onClick={() => setIdx((v) => v - 1)}>Previous</Btn>
            {idx < questions.length - 1
              ? <Btn onClick={() => setIdx((v) => v + 1)}>Next</Btn>
              : <Btn variant="green" onClick={() => onFinish(questions, answers)}>Submit quiz</Btn>}
          </div>
        </div>
      </PerforatedCard>
      <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
        {questions.map((qq, i) => (
          <button key={qq.uid} onClick={() => setIdx(i)} style={{
            width: 26, height: 26, fontSize: 11, borderRadius: 4, cursor: "pointer",
            border: `1px solid ${T.border}`, background: answers[qq.uid] !== undefined ? T.green : i === idx ? T.navy + "22" : "#fff",
            color: answers[qq.uid] !== undefined ? "#fff" : T.ink,
          }}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}

function QuizResult({ questions, answers, negMark, onDone }) {
  let correct = 0, wrong = 0, skipped = 0;
  questions.forEach((q) => {
    if (answers[q.uid] === undefined) skipped++;
    else if (answers[q.uid] === q.correct) correct++;
    else wrong++;
  });
  const raw = correct - (negMark ? wrong * 0.25 : 0);
  const percent = Math.max(0, Math.round((raw / questions.length) * 100));

  return (
    <div>
      <SectionTitle eyebrow="Result" title="Quiz Result" />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, marginBottom: 20 }}>
        <PerforatedCard><div style={{ padding: 20, display: "flex", justifyContent: "center" }}><ScoreSeal percent={percent} size={140} label="Overall score" /></div></PerforatedCard>
        <PerforatedCard>
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: T.success }}>{correct}</div><div style={{ fontSize: 12, color: T.muted }}>Correct</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: T.danger }}>{wrong}</div><div style={{ fontSize: 12, color: T.muted }}>Wrong</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 700, color: T.muted }}>{skipped}</div><div style={{ fontSize: 12, color: T.muted }}>Skipped</div></div>
          </div>
        </PerforatedCard>
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Review answers</div>
      <div style={{ display: "grid", gap: 10 }}>
        {questions.map((q) => (
          <PerforatedCard key={q.uid}>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 13, marginBottom: 6 }}>{q.text}</div>
              <div style={{ fontSize: 12, color: T.muted }}>
                Correct: <b style={{ color: T.success }}>{q.options[q.correct]}</b>
                {answers[q.uid] !== undefined && answers[q.uid] !== q.correct && <> &middot; Your answer: <b style={{ color: T.danger }}>{q.options[answers[q.uid]]}</b></>}
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4 }}>{q.explanation}</div>
            </div>
          </PerforatedCard>
        ))}
      </div>
      <div style={{ marginTop: 18 }}><Btn onClick={onDone}>Back to dashboard</Btn></div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SEARCH                                                              */
/* ------------------------------------------------------------------ */
function SearchPage() {
  const [q, setQ] = useState("");
  const results = q.length < 2 ? [] : SUBJECTS.flatMap((s) => s.questions.filter((qq) => qq.text.toLowerCase().includes(q.toLowerCase())).map((qq) => ({ ...qq, subject: s.name, color: s.color })));
  return (
    <div>
      <SectionTitle eyebrow="Global search" title="Search MCQs" />
      <div style={{ position: "relative", marginBottom: 18 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: T.muted }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by keyword, topic, or exam name…" style={{ ...inputStyle, paddingLeft: 36, marginTop: 0 }} />
      </div>
      {q.length >= 2 && <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 10 }}>{results.length} result(s) found</div>}
      <div style={{ display: "grid", gap: 10 }}>
        {results.map((r) => (
          <PerforatedCard key={r.id}>
            <div style={{ padding: 14 }}>
              <Pill color={r.color}>{r.subject}</Pill>
              <div style={{ fontSize: 13.5, marginTop: 8 }}>{r.text}</div>
            </div>
          </PerforatedCard>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  LEADERBOARD                                                         */
/* ------------------------------------------------------------------ */
function Leaderboard({ youName, youScore, youStreak }) {
  // Merge the real, locally-tracked student into the mock cohort and re-rank —
  // this is what makes the leaderboard feel live rather than purely decorative.
  const combined = useMemo(() => {
    const base = LEADERBOARD.map((u) => ({ ...u, isYou: false }));
    if (youScore !== null) {
      base.push({ name: youName, city: "You", score: youScore, streak: youStreak, isYou: true });
    }
    return base.sort((a, b) => b.score - a.score).map((u, i) => ({ ...u, rank: i + 1 }));
  }, [youName, youScore, youStreak]);

  return (
    <div>
      <SectionTitle eyebrow="This week" title="Leaderboard" />
      {youScore === null && (
        <div style={{ marginBottom: 14, padding: 12, background: "#FFF6E5", borderRadius: 4, fontSize: 12.5, color: T.warning }}>
          Complete a quiz to appear on the leaderboard with your own score and streak.
        </div>
      )}
      <PerforatedCard>
        <div style={{ padding: 6 }}>
          {combined.map((u) => (
            <div key={u.isYou ? "you" : u.rank} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
              borderBottom: `1px solid ${T.border}`,
              background: u.isYou ? T.green + "10" : "transparent",
            }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: u.rank <= 3 ? T.gold : "#EEF1F2", color: u.rank <= 3 ? "#2A2210" : T.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{u.rank}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  {u.name} {u.isYou && <Pill color={T.green}>You</Pill>}
                </div>
                <div style={{ fontSize: 11.5, color: T.muted }}>{u.city} &middot; {u.streak}-day streak</div>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: T.navyDark }}>{u.score}%</div>
            </div>
          ))}
        </div>
      </PerforatedCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ANALYTICS                                                           */
/* ------------------------------------------------------------------ */
function Analytics({ subjectStrength, trend }) {
  const weakest = [...subjectStrength].sort((a, b) => a.percent - b.percent)[0];
  return (
    <div>
      <SectionTitle eyebrow="Performance" title="Analytics Dashboard" />
      <PerforatedCard>
        <div style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navyDark, marginBottom: 10 }}>Score trend over recent attempts</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid stroke="#EEF1F2" />
              <XAxis dataKey="attempt" tick={{ fontSize: 11 }} stroke={T.muted} />
              <YAxis tick={{ fontSize: 11 }} stroke={T.muted} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke={T.navy} strokeWidth={2.5} dot={{ r: 4, fill: T.gold }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </PerforatedCard>
      <div style={{ marginTop: 20 }} />
      <PerforatedCard>
        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.navyDark, marginBottom: 14 }}>Subject-wise strength & time flags</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {subjectStrength.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 150, fontSize: 12.5 }}>{s.name}</div>
                <div style={{ flex: 1, height: 8, background: "#EEF1F2", borderRadius: 4 }}>
                  <div style={{ width: `${s.percent}%`, height: "100%", background: s.percent >= 75 ? T.success : s.percent >= 50 ? T.warning : T.danger, borderRadius: 4 }} />
                </div>
                <div style={{ width: 60, fontSize: 11, color: T.muted, textAlign: "right" }}>{s.avgTime}s/q</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: "#FBEAE8", borderRadius: 4, fontSize: 12.5, color: T.danger }}>
            <b>Recommendation:</b> Focus more on {weakest.name} this week — lowest strength score and slowest response time.
          </div>
        </div>
      </PerforatedCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROFILE                                                             */
/* ------------------------------------------------------------------ */
function Profile({ profile, setProfile, uiLang, setUiLang, onLogout, badges, onSave, saveStatus }) {
  return (
    <div>
      <SectionTitle eyebrow="Account" title="Profile & Settings" />
      {badges.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {badges.map((b) => (
            <span key={b.label} style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700,
              padding: "6px 12px", borderRadius: 20,
              background: (b.tone === "gold" ? T.gold : b.tone === "success" ? T.success : T.warning) + "1A",
              color: b.tone === "gold" ? "#8A6D1F" : b.tone === "success" ? T.success : T.warning,
            }}>
              <Award size={13} /> {b.label}
            </span>
          ))}
        </div>
      )}
      <PerforatedCard>
        <div style={{ padding: 22, maxWidth: 420 }}>
          <label style={{ fontSize: 12, color: T.muted }}>Full name</label>
          <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <label style={{ fontSize: 12, color: T.muted, marginTop: 12, display: "block" }}>Target exam</label>
          <select value={profile.targetExam} onChange={(e) => setProfile((p) => ({ ...p, targetExam: e.target.value }))} style={inputStyle}>
            {Object.keys(EXAM_WEIGHTAGE).map((k) => <option key={k}>{k}</option>)}
          </select>
          <label style={{ fontSize: 12, color: T.muted, marginTop: 12, display: "block" }}>Target post / department</label>
          <input value={profile.targetDept} onChange={(e) => setProfile((p) => ({ ...p, targetDept: e.target.value }))} style={inputStyle} />

          <label style={{ fontSize: 12, color: T.muted, marginTop: 12, display: "block" }}>Interface language</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={() => setUiLang("en")} style={tabBtn(uiLang === "en")}><Globe2 size={13} style={{ marginRight: 4 }} />English</button>
            <button onClick={() => setUiLang("ur")} style={tabBtn(uiLang === "ur")}><Globe2 size={13} style={{ marginRight: 4 }} />اردو</button>
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
            <Btn variant="green" onClick={onSave}>{saveStatus === "saving" ? "Saving…" : "Save changes"}</Btn>
            {saveStatus === "saved" && <span style={{ fontSize: 12, color: T.success, marginLeft: 10 }}>Saved</span>}
            <Btn variant="ghost" onClick={onLogout}><LogOut size={14} /> Log out</Btn>
          </div>
        </div>
      </PerforatedCard>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CURRENT AFFAIRS                                                     */
/* ------------------------------------------------------------------ */
function CurrentAffairs() {
  return (
    <div>
      <SectionTitle eyebrow="Auto-updated monthly" title="Current Affairs Packs" />
      <div style={{ display: "grid", gap: 12 }}>
        {CURRENT_AFFAIRS_PACKS.map((c) => (
          <PerforatedCard key={c.id}>
            <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{c.month} {c.tag && <Pill color={T.gold}>{c.tag}</Pill>}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{c.count} curated MCQs from national & international news</div>
              </div>
              <Btn variant="ghost">Open pack</Btn>
            </div>
          </PerforatedCard>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APP SHELL                                                           */
/* ------------------------------------------------------------------ */
export default function App() {
  const [view, setView] = useState("home"); // home | auth | app
  const [authMode, setAuthMode] = useState("login");
  const [page, setPage] = useState("dashboard");
  const [practiceSubject, setPracticeSubject] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [uiLang, setUiLang] = useState("en");
  const [profile, setProfile] = useState({ name: "Ahmed Raza", targetExam: "FIA", targetDept: "Sub-Inspector" });
  const [quizConfig, setQuizConfig] = useState(null);
  const [quizResultData, setQuizResultData] = useState(null);
  const [trend, setTrend] = useState(TREND_SEED.map((s, i) => ({ attempt: `Attempt ${i + 1}`, score: s })));

  // Real, locally-persisted streak/score tracking (see lib/streak.js).
  // Hydrated after mount only, since localStorage isn't available during SSR.
  const [streak, setStreak] = useState(0);
  const [practicedToday, setPracticedToday] = useState(false);
  const [avgScore, setAvgScore] = useState(null);
  const [badges, setBadges] = useState([]);

  function refreshStreakState() {
    setStreak(getStreak());
    setPracticedToday(hasPracticedToday());
    setAvgScore(getAverageScore());
    setBadges(getBadges());
    const hist = getHistory();
    if (hist.length) setTrend(hist.slice(-8).map((h, i) => ({ attempt: `Attempt ${i + 1}`, score: h.score })));
  }
  useEffect(() => { refreshStreakState(); }, []);

  // Sprint 1: hydrate from a real Supabase session on load, so a returning,
  // already-logged-in student lands straight in the app instead of the home page.
  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadProfileAndEnterApp(supabase, data.session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setView((v) => (v === "app" ? "home" : v));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfileAndEnterApp(supabase, userId) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (p) {
      setProfile((prev) => ({ ...prev, name: p.display_name, targetExam: p.target_exam || prev.targetExam, targetDept: p.target_post || prev.targetDept }));
      setUiLang(p.ui_language || "en");
    }
    setView("app");
  }

  async function handleAuthed() {
    const supabase = createSupabaseClient();
    const { data } = await supabase.auth.getSession();
    if (data.session) await loadProfileAndEnterApp(supabase, data.session.user.id);
  }

  async function handleLogout() {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    setView("home");
  }

  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  async function handleSaveProfile() {
    setSaveStatus("saving");
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaveStatus("idle"); return; }
    await supabase.from("profiles").update({
      display_name: profile.name, target_exam: profile.targetExam,
      target_post: profile.targetDept, ui_language: uiLang,
    }).eq("id", user.id);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  const subjectStrength = useMemo(() => ([
    { id: "gk", name: "General Knowledge", percent: 82, avgTime: 38 },
    { id: "english", name: "English", percent: 71, avgTime: 46 },
    { id: "urdu", name: "Urdu", percent: 88, avgTime: 30 },
    { id: "islamiat", name: "Islamic Studies", percent: 79, avgTime: 33 },
    { id: "pakstudy", name: "Pakistan Studies & Current Affairs", percent: 65, avgTime: 42 },
    { id: "math", name: "Mathematics", percent: 54, avgTime: 61 },
    { id: "reasoning", name: "Analytical Reasoning", percent: 48, avgTime: 68 },
    { id: "science", name: "Everyday Science", percent: 74, avgTime: 35 },
    { id: "computer", name: "Computer & IT", percent: 90, avgTime: 25 },
  ]), []);
  const weakest = [...subjectStrength].sort((a, b) => a.percent - b.percent)[0];

  function toggleBookmark(id) {
    setBookmarks((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function goPage(p, subjectId) {
    setPage(p); setSidebarOpen(false);
    if (subjectId) setPracticeSubject(subjectId);
  }
  function handleAttemptPastPaper(paper) {
    const wt = {}; SUBJECTS.forEach((s, i) => { if (i < 4) wt[s.id] = i === 0 ? 40 : 20; });
    setQuizConfig({ examBody: paper.body, weightage: wt, totalQ: paper.questions, timer: paper.duration, negMark: true });
    setPage("quizrunning");
  }
  function handleQuizStart(config) { setQuizConfig(config); setPage("quizrunning"); }
  function handleQuizFinish(questions, answers) {
    setQuizResultData({ questions, answers });
    let correct = 0;
    questions.forEach((q) => { if (answers[q.uid] === q.correct) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    recordActivity(pct);      // persists today's date + score to localStorage
    refreshStreakState();     // re-reads streak/badges/trend so the UI reflects it immediately
    setPage("quizresult");
  }

  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;700&display=swap');`;

  if (view === "home") {
    return <><style>{fontImport}{`*{font-family:'Inter',sans-serif;box-sizing:border-box}`}</style><HomePage onEnter={(m) => { setAuthMode(m); setView("auth"); }} /></>;
  }
  if (view === "auth") {
    return <><style>{fontImport}{`*{font-family:'Inter',sans-serif;box-sizing:border-box}`}</style><AuthPage mode={authMode} setMode={setAuthMode} onAuthed={handleAuthed} onBack={() => setView("home")} /></>;
  }

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 640, background: T.bg, fontFamily: "'Inter',sans-serif" }}>
      <style>{fontImport}{`*{box-sizing:border-box} ::-webkit-scrollbar{width:8px} ::-webkit-scrollbar-thumb{background:#ccd3d8;border-radius:4px}`}</style>

      {/* Sidebar */}
      <div style={{
        width: 224, background: T.navyDark, color: "#fff", flexShrink: 0, padding: "20px 14px",
        position: sidebarOpen ? "fixed" : "static", zIndex: 30, height: sidebarOpen ? "100%" : "auto",
        display: sidebarOpen ? "block" : undefined,
      }} className={sidebarOpen ? "" : "hidden md:block"}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 4, background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: T.navyDark, fontSize: 13 }}>1</div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15 }}>OnePaperPrep</span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "#fff" }}><X size={18} /></button>
        </div>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => goPage(n.id)} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "9px 10px",
            marginBottom: 3, borderRadius: 4, border: "none", cursor: "pointer", fontSize: 13,
            background: page === n.id ? "rgba(198,161,91,0.18)" : "transparent", color: page === n.id ? T.gold : "#CBD5DA",
          }}>
            <n.icon size={16} /> {UI_TEXT[uiLang][n.id]}
          </button>
        ))}
      </div>
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 20 }} />}

      {/* Main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ height: 56, background: T.surface, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 18px", gap: 14 }}>
          <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none" }}><Menu size={20} /></button>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 9 }} color={T.muted} />
            <input placeholder="Quick search…" onFocus={() => goPage("search")} readOnly style={{ ...inputStyle, marginTop: 0, paddingLeft: 30, cursor: "pointer" }} />
          </div>
          <Bell size={18} color={T.muted} />
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => goPage("profile")}>
            {profile.name.split(" ").map((w) => w[0]).join("")}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {page === "dashboard" && <Dashboard profile={profile} subjectStrength={subjectStrength} weakest={weakest} goPage={goPage} streak={streak} practicedToday={practicedToday} />}
          {page === "practice" && <Practice initialSubject={practiceSubject} bookmarks={bookmarks} toggleBookmark={toggleBookmark} />}
          {page === "pastpapers" && <PastPapers onAttempt={handleAttemptPastPaper} />}
          {page === "quizbuilder" && <QuizBuilder onStart={handleQuizStart} />}
          {page === "quizrunning" && quizConfig && <QuizRunner config={quizConfig} onFinish={handleQuizFinish} />}
          {page === "quizresult" && quizResultData && <QuizResult questions={quizResultData.questions} answers={quizResultData.answers} negMark={quizConfig?.negMark} onDone={() => goPage("dashboard")} />}
          {page === "search" && <SearchPage />}
          {page === "leaderboard" && <Leaderboard youName={profile.name} youScore={avgScore} youStreak={streak} />}
          {page === "analytics" && <Analytics subjectStrength={subjectStrength} trend={trend} />}
          {page === "profile" && <Profile profile={profile} setProfile={setProfile} uiLang={uiLang} setUiLang={setUiLang} onLogout={handleLogout} badges={badges} onSave={handleSaveProfile} saveStatus={saveStatus} />}
          {page === "currentaffairs" && <CurrentAffairs />}
        </div>
      </div>
    </div>
  );
}

