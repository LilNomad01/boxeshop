import type { Metadata } from "next";
import "./globals.css"
import { TikTokPixel } from "./tiktok-pixel";

export const metadata: Metadata = {
  title: "EcomHub Store",
  description: "Loja conectada ao EcomHub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased"><TikTokPixel />{children}</body>
    </html>
  );
}
