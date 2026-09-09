import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "@/styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Intelligence Platform",
  description:
    "CommonSpirit Health NRES PDC — ambulatory and acute care facility design guidelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body>{children}</body>
    </html>
  );
}
