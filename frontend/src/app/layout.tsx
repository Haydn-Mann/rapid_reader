import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Rapid Reader",
  description: "Absorb articles faster with Rapid Reader.",
  icons: {
    icon: "/images/indicator.png",
    apple: "/images/indicator.png",
  },
  openGraph: {
    title: "Rapid Reader",
    description: "Absorb articles faster with Rapid Reader.",
    type: "website",
    siteName: "Rapid Reader",
    url: getBaseUrl(),
    locale: "en_US",
    images: [
      {
        url: `${getBaseUrl()}/images/indicator.png`,
        width: 1200,
        height: 627, // LinkedIn prefers 627, but 630 works for all platforms
        alt: "Rapid Reader - Speed reading tool",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rapid Reader",
    description: "Absorb articles faster with Rapid Reader.",
    images: [`${getBaseUrl()}/images/indicator.png`],
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
