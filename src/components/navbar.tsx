"use client";

// BioBuddy Navigation Component
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { useTour } from "@/hooks/useTour";

export const Navbar = () => {
  const { startTour } = useTour();

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
            <Link 
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
            </Link>
            <button
              onClick={startTour}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Take a tour"
              aria-label="Help - Take a tour"
            >
              <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

