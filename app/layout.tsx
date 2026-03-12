import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "easymde/dist/easymde.min.css";
import { Toaster } from "react-hot-toast";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/components/providers"; // ← fixed path

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AccuFin - Financial Management Solutions",
  description: "Your trusted partner in financial management and accounting solutions.",
  icons: {
    icon: "/image-000.png",
    shortcut: "/image-000.png",
    apple: "/image-000.png",
  },
};

export default async function RootLayout({ // ← must be async
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster />
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}