import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Battle — Daily Report System",
  description: "Individual ও Team দৈনিক রিপোর্ট সংগ্রহ, ব্যবস্থাপনা ও ফাইনাল রিপোর্ট।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
