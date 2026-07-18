import "./globals.css";

export const metadata = {
  title: "OnePaperPreparation \u2014 One Paper Exam Prep",
  description: "Subject-wise practice, past papers, a syllabus-weighted quiz builder, and performance analytics for Pakistan's One Paper competitive exams.",
};

// Fonts are loaded once, here, in the root layout (a Server Component) so the
// <link> tags are identical on every server render and every client render —
// this is what actually fixes the earlier hydration-mismatch warning, which
// was caused by AppShell (a Client Component) injecting its own <style>
// font-import tag differently depending on which screen (home/auth/app) was showing.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
