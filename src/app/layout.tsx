import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Design Intelligence Platform",
  description:
    "CommonSpirit Health NRES PDC — ambulatory and acute care facility design guidelines.",
};

// Nav shell (fonts, brand tokens) added in a later commit.
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
