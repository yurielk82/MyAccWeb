import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Acc - 장부 관리 시스템",
  description: "스프레드시트 연동 장부 관리 시스템",
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
