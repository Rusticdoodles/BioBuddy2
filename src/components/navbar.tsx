// BioBuddy Navigation Component
import Link from "next/link";

export const Navbar = () => {
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
          </div>
        </div>
      </div>
    </nav>
  );
};

