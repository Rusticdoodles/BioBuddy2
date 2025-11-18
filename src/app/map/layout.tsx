import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Concept Map',
  description: 'Create AI-powered concept maps for any biology topic. Visualize complex relationships and master your biology studies.',
  openGraph: {
    title: 'Create Concept Map | BioBuddy',
    description: 'Create AI-powered concept maps for any biology topic. Visualize complex relationships and master your biology studies.',
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


