import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcomHub Store",
  description: "Loja conectada ao EcomHub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
