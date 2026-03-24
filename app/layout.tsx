import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beyond Campus — Land Your Dream Job Without Campus Placements",
  description: "Get mentorship, referrals, and proven strategies to break into top jobs off-campus. 2500+ students placed at Amazon, CRED, Razorpay and more.",
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: "Beyond Campus — Land Your Dream Job",
    description: "Break into top jobs without campus placements.",
    url: "https://beyond-campus.in",
    siteName: "Beyond Campus",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}