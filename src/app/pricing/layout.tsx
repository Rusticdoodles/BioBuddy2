import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Choose the perfect BioBuddy plan for your biology studies. Free tier, affordable monthly subscription, or lifetime access.',
  openGraph: {
    title: 'Pricing | BioBuddy',
    description: 'Choose the perfect BioBuddy plan for your biology studies. Free tier, affordable monthly subscription, or lifetime access.',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

