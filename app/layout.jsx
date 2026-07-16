import "./globals.css";

export const metadata = {
  title: "OnePaperPreparation \u2014 One Paper Exam Prep",
  description: "Subject-wise practice, past papers, a syllabus-weighted quiz builder, and performance analytics for Pakistan's One Paper competitive exams.",
};

// Fonts (Playfair Display / Inter / IBM Plex Mono) are loaded inside
// components/AppShell.jsx via a client-side <style> tag. This keeps the
// production build from depending on network access to fonts.googleapis.com
// at build time (Next's automatic <link> font optimizer requires that).
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
