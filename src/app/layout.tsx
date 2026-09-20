import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LX-Downloader - Free Instagram & YouTube Media Saver",
  description: "Download Instagram Reels, Stories, Photos, DP, Highlights, and YouTube Videos or Shorts instantly in high quality (HD). 100% Free, secure, and no login required.",
  keywords: [
    "instagram downloader",
    "instagram reels downloader",
    "instagram story saver",
    "instagram photo downloader",
    "instagram dp downloader",
    "instagram highlight downloader",
    "youtube video downloader",
    "youtube shorts downloader",
    "download instagram reels",
    "download youtube shorts",
    "free media downloader"
  ],
  alternates: {
    canonical: "https://lx-down.vercel.app",
  },
  openGraph: {
    title: "LX-Downloader - Free Instagram & YouTube Media Saver",
    description: "Download Instagram Reels, Stories, Photos, DP, Highlights, and YouTube Videos or Shorts instantly in high quality (HD).",
    url: "https://lx-down.vercel.app",
    siteName: "LX-Downloader",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LX-Downloader - Free Instagram & YouTube Media Saver",
    description: "Download Instagram Reels, Stories, Photos, DP, Highlights, and YouTube Videos or Shorts instantly in high quality (HD).",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-blue-600/30 selection:text-blue-100">
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
