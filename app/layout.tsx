import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Roaster - AI CV Review & Feedback",
  description:
    "Get instant, AI-powered feedback on your CV. Upload your resume and receive actionable tips to improve your chances of landing your dream job!",
  generator: "Next.js",
  openGraph: {
    title: "CV Roaster - AI CV Review & Feedback",
    description:
      "Get instant, AI-powered feedback on your CV. Upload your resume and receive actionable tips to improve your chances of landing your dream job!",
    url: "https://cvroaster.vercel.app/",
    type: "website",
    images: [
      {
        url: "https://cvroaster.vercel.app/placeholder-logo.png",
        width: 1200,
        height: 630,
        alt: "CV Roaster Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Roaster - AI CV Review & Feedback",
    description:
      "Get instant, AI-powered feedback on your CV. Upload your resume and receive actionable tips to improve your chances of landing your dream job!",
    images: ["https://cvroaster.vercel.app/placeholder-logo.png"],
    site: "@aldo_tobing",
  },
  icons: {
    icon: "/placeholder-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
