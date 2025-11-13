"use client";

// BioBuddy Navigation Component
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, MessageSquare } from "lucide-react";
import { useTour } from "@/hooks/useTour";
import { FeedbackModal } from "@/components/FeedbackModal";
import { AuthModal } from "@/components/AuthModal";
import { useUser } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

export const Navbar = () => {
  const { startFullTour } = useTour();
  const { user } = useUser();
  const pathname = usePathname();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleOpenAuthModal = () => {
    setIsAuthOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthOpen(false);
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
  };

  return (
    <nav className="bg-neutral-100 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 transition-colors hover:text-blue-700"
            aria-label="Go to BioBuddy home page"
          >
            BioBuddy
          </Link>

          <div className="flex items-center gap-4">
            <button
              data-tour="feedback-btn"
              onClick={() => setIsFeedbackOpen(true)}
              className="hover-scale-sm flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-green-600 transition-colors hover:bg-slate-100 hover:text-green-600 dark:text-green-300 dark:hover:bg-slate-800 dark:hover:text-green-300"
              title="Give Feedback"
              aria-label="Give Feedback"
              tabIndex={0}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Give Feedback</span>
            </button>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                  <span className="hidden lg:inline" aria-live="polite">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSigningOut}
                    aria-label="Sign out of BioBuddy"
                  >
                    {isSigningOut ? "Signing out" : "Sign Out"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenAuthModal}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Sign in to BioBuddy"
                  tabIndex={0}
                >
                  Sign In
                </button>
              )}
            {user && (
              <Link
                href="/dashboard"
                className="hover-scale-sm flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-600 transition-colors hover:bg-slate-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-800 dark:hover:text-blue-300"
                aria-label="Go to Dashboard"
                tabIndex={0}
              >
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}
            </div>
            {pathname === "/map" && (
              <button
                onClick={startFullTour}
                className="hover-scale-sm mr-5 rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Tutorial"
                aria-label="Help - Tutorial"
              >
                <HelpCircle className="h-5 w-5 text-blue-600 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" />
              </button>
            )}
          </div>
        </div>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AuthModal isOpen={isAuthOpen && !user} onClose={handleCloseAuthModal} />
    </nav>
  );
};

