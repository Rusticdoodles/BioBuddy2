"use client";

// BioBuddy Navigation Component
import { useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquare } from "lucide-react";
import { useTour } from "@/hooks/useTour";
import { FeedbackModal } from "@/components/FeedbackModal";

export const Navbar = () => {
  const { startFullTour } = useTour();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            BioBuddy
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* <Link 
              href="/" 
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/map" 
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Concept Map
            </Link> */}
            <button
              data-tour="feedback-btn"
              onClick={() => setIsFeedbackOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 
                       hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hover-scale-sm"
              title="Give feedback"
              aria-label="Give feedback"
              tabIndex={0}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Give Feedback</span>
            </button>
            <button
              onClick={startFullTour}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover-scale-sm transition-colors mr-5"
              title="Take a tour"
              aria-label="Help - Take a tour"
            >
              <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </nav>
  );
};

