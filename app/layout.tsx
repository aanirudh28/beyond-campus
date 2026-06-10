import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "./components/WhatsAppButton";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: 'Beyond Campus — Land Your Dream Internship Without Campus Placements',
  description: "Beyond Campus helps non-tech students from tier-2 and tier-3 colleges crack consulting, finance, Founder's Office, and startup internships off-campus. Cold email templates, resume builder, live mentorship.",
  keywords: 'off campus internship India, consulting internship without IIM, cold email templates internship, non tech students placement, BBA BCom internship tips, summer internship 2025 India, founder office internship, finance internship India',
  metadataBase: new URL('https://www.beyond-campus.in'),
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'Beyond Campus — Land Your Dream Internship Without Campus Placements',
    description: "Cold email templates, resume builder, and live mentorship for non-tech students targeting consulting, finance, and startup roles off-campus.",
    url: 'https://www.beyond-campus.in',
    siteName: 'Beyond Campus',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beyond Campus — Off-Campus Placement for Non-Tech Students',
    description: 'Cold email templates, resume builder, and live mentorship for consulting, finance, and startup roles.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://www.beyond-campus.in',
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
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KPET6Y3JGQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KPET6Y3JGQ');
          `}
        </Script>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}