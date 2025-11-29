import type { Metadata } from "next";
import { Geist_Mono, Figtree, Young_Serif } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

const hubotSans = Figtree({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const youngSans = Young_Serif({
  variable: "--font-young-sans",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Careers Page Builder",
  description: "Build and manage your company's careers page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hubotSans.variable} ${geistMono.variable} ${youngSans.variable} font-sans antialiased`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
