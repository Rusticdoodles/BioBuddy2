import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your BioBuddy learning statistics, manage your subscription, and track your biology study progress.',
  openGraph: {
    title: 'Dashboard | BioBuddy',
    description: 'View your BioBuddy learning statistics, manage your subscription, and track your biology study progress.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

