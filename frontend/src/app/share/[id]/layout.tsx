import type { Metadata } from "next";

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
  title: "Your mate shared an interesting article with you",
  description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
  openGraph: {
    title: "📖 Your mate shared an interesting article with you",
    description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
    type: "website",
    siteName: "Rapid Reader",
    images: [
      {
        url: "/images/indicator.png",
        width: 1200,
        height: 630,
        alt: "Rapid Reader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "📖 Your mate shared an interesting article with you",
    description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
    images: ["/images/indicator.png"],
  },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
