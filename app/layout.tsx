import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "fLink",
  description: "F.Oliveira - URL shortener",
  robots: "noindex",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL || "https://flink.franciscoliveira.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Providers>{children}</Providers>
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
