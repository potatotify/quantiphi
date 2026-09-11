import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Currency Converter",
  description: "Real-time currency conversion with live exchange rates.",
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