import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAAV — India ka product leaderboard",
  description:
    "Discover products and businesses competing for the top spot. Aaj Ka Daav, in rupees.",
  applicationName: "DAAV",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
