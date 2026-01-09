import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import { InterstitialAd } from "@/components/ui/InterstitialAd";
import { GoogleAdSense } from "@/components/GoogleAdSense";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleTagManager } from "@/components/GoogleTagManager";
import { Providers } from "@/components/providers";
import { connectDB } from "@/lib/db";
import { getSiteConfig } from "@/lib/models/SiteConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const config = await getSiteConfig();

    return {
      title: config.seo.metaTitle || config.siteName || "NearMatch",
      description: config.seo.metaDescription || config.siteDescription || "Find your perfect match nearby",
      manifest: "/api/manifest",
      applicationName: config.pwa.name || "NearMatch",
      appleWebApp: {
        capable: config.pwa.enabled,
        statusBarStyle: "black-translucent",
        title: config.pwa.shortName || "NearMatch",
      },
      formatDetection: {
        telephone: false,
      },
      icons: {
        icon: config.pwa.icons?.[0]?.src ? config.pwa.icons.map((icon: { src: string; sizes: string; type: string }) => ({
          url: icon.src,
          sizes: icon.sizes,
          type: icon.type
        })) : [
          { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
          { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
      openGraph: {
        title: config.seo.metaTitle || config.siteName || "NearMatch",
        description: config.seo.metaDescription || config.siteDescription || "Find your perfect match nearby",
        url: config.siteUrl,
        siteName: config.siteName,
        images: config.seo.ogImage ? [{ url: config.seo.ogImage }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: config.seo.metaTitle || config.siteName || "NearMatch",
        description: config.seo.metaDescription || config.siteDescription || "Find your perfect match nearby",
        images: config.seo.ogImage ? [config.seo.ogImage] : [],
      },
      verification: {
        google: config.seo.googleConsoleVerification || "sFvlagncjj--2AKNWIY66zONBb_t-c7Mv4nc9fgyY0g",
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "NearMatch - Find Your Perfect Match Nearby",
      description: "Dating app to find amazing people near you",
      manifest: "/api/manifest",
      icons: {
        icon: [
          { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
          { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
    };
  }
}

export const viewport: Viewport = {
  themeColor: "#ec4899",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectDB();
  const config = await getSiteConfig();

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/api/manifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NearMatch" />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAdSense pId={config.ads.googleAdSenseId || ''} />
        <GoogleAnalytics id={config.seo.googleAnalyticsId || ''} />
        <GoogleTagManager id={config.seo.googleTagManagerId || ''} />
        <Providers>
          {children}
          <PWAInstallPrompt />
          <InterstitialAd />
        </Providers>
      </body>
    </html>
  );
}
