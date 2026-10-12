import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

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
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "RefPulse helps businesses grow through powerful referral campaigns. Register, launch a campaign, and let your customers do the marketing.",
  keywords: ["referral system", "referral marketing", "word of mouth", "campaign", "rewards"],
};

import QueryProvider from "@/components/providers/QueryProvider";
import ToastProvider from "@/components/providers/ToastProvider";
import { MobileNavProvider } from "@/components/providers/MobileNavProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
        <QueryProvider>
          <MobileNavProvider>
            {children}
            <ToastProvider />
          </MobileNavProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


