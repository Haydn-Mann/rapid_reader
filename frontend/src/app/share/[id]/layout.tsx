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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/share/${id}`;
  const imageUrl = `${baseUrl}/images/indicator.png`;

  return {
    metadataBase: new URL(baseUrl),
    title: "Your mate shared an interesting article with you",
    description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Open Graph - Works for Teams, LinkedIn, Facebook, Discord, Slack, WhatsApp
    openGraph: {
      title: "📖 Your mate shared an interesting article with you",
      description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
      type: "website",
      siteName: "Rapid Reader",
      url: shareUrl,
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630, // Changed to 630 for better WhatsApp/Teams compatibility
          alt: "Rapid Reader - Speed reading tool",
          type: "image/png",
        },
      ],
    },
    // Twitter/X Card
    twitter: {
      card: "summary_large_image",
      title: "📖 Your mate shared an interesting article with you",
      description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
      images: [imageUrl],
    },
    // Additional meta tags for better compatibility
    alternates: {
      canonical: shareUrl,
    },
  };
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
