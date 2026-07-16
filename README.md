# OnePaperPreparation

A standalone Next.js prototype for OnePaperPreparation — subject-wise MCQ
practice, past papers, a syllabus-weighted Quiz Builder, performance
analytics, and a **working Leaderboard + Streaks system**, built to deploy
straight to Vercel's free tier, with a custom domain added later.

## What's real vs. mock in this version

| Feature | Status |
|---|---|
| **Streaks** | **Real.** Every quiz you finish is recorded with today's date in your browser's storage. The streak count, "practiced today" status, and badges (3/7/30-day streaks, Top Scorer, Consistent Performer) are all computed from that real history — refresh the page and they're still there. |
| **Leaderboard** | **Real for you, mock for others.** Your own row (score + streak) is computed live from your practice history and merged into a ranked list alongside sample students, so you can see exactly how the ranking will work once real accounts exist. |
| Quiz Builder, syllabus weightage, analytics charts | Functional UI, but the *questions* are a small sample set (a few per subject) — see "Next: growing the content" below. |
| Login/Signup | UI only — no real account system yet (see roadmap). |
| MCQ bank | ~30 sample questions total, across 10 subjects. |

The streak/leaderboard logic lives in `lib/streak.js`, all backed by
`localStorage` (no server needed for the MVP). When you're ready for real
accounts, that file is the only place that needs to change — swap each
function for an API call with the same name and return shape, and nothing
else in the app needs to be rewritten.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — sign up (any email/password works, it's not
checked yet), complete a quiz, then check the Dashboard and Leaderboard
pages to see your streak and score appear.

## Deploy to Vercel (free tier, no domain needed yet)

1. Push this folder to a new GitHub repository (Vercel deploys from GitHub, GitLab, or Bitbucket):
   ```bash
   git init
   git add .
   git commit -m "Initial OnePaperPreparation prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/onepaperpreparation.git
   git push -u origin main
   ```
2. Go to https://vercel.com and sign up/log in (GitHub login is easiest).
3. Click **Add New → Project**, then select your `onepaperpreparation` repository.
4. Vercel auto-detects Next.js — leave all settings as default and click **Deploy**.
5. In 1–2 minutes you'll get a live URL like `onepaperpreparation.vercel.app` — that's your free, real, shareable link. No credit card, no domain purchase needed.

## Adding a custom domain later

Once you've bought a domain (from Namecheap, GoDaddy, PKNIC for `.pk`, etc.):

1. In the Vercel dashboard, open your project → **Settings → Domains**.
2. Type your domain and click **Add**.
3. Vercel shows you either an **A record** or **CNAME** to add at your domain
   registrar's DNS settings page — copy that value into your registrar's DNS panel.
4. Wait 10 minutes–a few hours for DNS to propagate. Vercel automatically
   issues a free SSL certificate, so your site becomes `https://yourdomain.com`
   with no extra cost.

You do not need to redeploy or change any code for this step — it's pure DNS configuration.

## Next: growing the content and real accounts

This prototype is intentionally light on content so it's fast to review and
deploy. The natural next steps (see the separate Project Brief document) are:

1. Import your existing MCQ PDF banks into the app's data format.
2. Add a real database (e.g. Supabase/Neon Postgres) + real auth (Supabase
   Auth or Firebase) so streaks/leaderboard/scores persist per real account
   instead of per-browser.
3. Build the admin panel for you to keep adding MCQs after launch.

None of this requires re-building what's here — it's additive.
