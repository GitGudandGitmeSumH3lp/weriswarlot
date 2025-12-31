import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- MUST BE HERE

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WERISWARLOT",
  description: "Forensic Simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}