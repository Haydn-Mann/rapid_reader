import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your mate shared an interesting article with you",
  description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
  openGraph: {
    title: "📖 Your mate shared an interesting article with you",
    description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
    type: "website",
    siteName: "Rapid Reader",
  },
  twitter: {
    card: "summary",
    title: "📖 Your mate shared an interesting article with you",
    description: "Absorb this article in your brain using Rapid Reader. The link expires in 2 hours.",
  },
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
