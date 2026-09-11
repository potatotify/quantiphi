import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Currency Converter",
  description: "A currency converter foundation built with Next.js, TypeScript, Tailwind CSS, Prisma, and SQLite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}