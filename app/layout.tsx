import type { Metadata, Viewport } from "next";
import { faviconConfig } from "@/config/favicon";
import { fontConfig } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: siteConfig.pwa.themeColor,
};

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: [
      { url: faviconConfig.icon16, sizes: "16x16", type: "image/png" },
      { url: faviconConfig.icon32, sizes: "32x32", type: "image/png" },
    ],
    shortcut: faviconConfig.icon32,
    apple: [
      {
        url: faviconConfig.appleTouch,
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full scroll-smooth antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={fontConfig.googleFontsUrl} rel="stylesheet" />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
