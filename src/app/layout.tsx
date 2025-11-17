import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/tour.css";
import "@/styles/selection.css";

import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BioBuddy",
    template: "%s | BioBuddy",
  },
  description:
    "Join university students who use BioBuddy to visualize complex biology concepts and ace their exams with AI-powered concept maps.",
  keywords: [
    "biology",
    "concept maps",
    "study tool",
    "AI learning",
    "university",
    "education",
    "biology study",
    "medical school",
    "visual learning",
    "exam preparation",
  ],
  authors: [{ name: "BioBuddy" }],
  creator: "BioBuddy",
  publisher: "BioBuddy",
  metadataBase: new URL("https://biobuddy.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://biobuddy.io",
    title: "BioBuddy - Master Biology with AI-Powered Concept Maps",
    description:
      "Join university students who use BioBuddy to visualize complex biology concepts and ace their exams with AI-powered concept maps.",
    siteName: "BioBuddy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BioBuddy - AI-Powered Biology Concept Maps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BioBuddy - Master Biology with AI-Powered Concept Maps",
    description:
      "Join university students who use BioBuddy to visualize complex biology concepts and ace their exams with AI-powered concept maps.",
    images: ["/og-image.png"],
    creator: "@biobuddy",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
