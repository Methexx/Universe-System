import type { Metadata } from "next";
import { Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { UnreadMessagesProvider } from "@/features/messages/context/UnreadMessagesContext";

const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniVerse Platform",
  description: "School operations dashboard for admin, teacher, and security roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${kumbhSans.variable} antialiased`}
        style={{ fontFamily: "var(--font-kumbh-sans), sans-serif" }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <UnreadMessagesProvider>{children}</UnreadMessagesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
