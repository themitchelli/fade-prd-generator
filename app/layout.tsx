import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ralph PRD Generator",
  description: "Generate well-structured PRDs with AI guidance",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
