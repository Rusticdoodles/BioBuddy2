import { Navbar } from "@/components/navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 relative overflow-hidden">
      <Navbar />

      {/* Decorative floating shapes - biology themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* DNA Helix - top right */}
        <div className="absolute top-20 right-[10%] w-24 h-24 md:w-32 md:h-32 opacity-20 animate-float">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M30 10 Q 40 30, 30 50 T 30 90" stroke="#3b82f6" strokeWidth="3" fill="none" />
            <path d="M70 10 Q 60 30, 70 50 T 70 90" stroke="#3b82f6" strokeWidth="3" fill="none" />
            <line x1="30" y1="20" x2="70" y2="20" stroke="#3b82f6" strokeWidth="2" />
            <line x1="30" y1="40" x2="70" y2="40" stroke="#3b82f6" strokeWidth="2" />
            <line x1="30" y1="60" x2="70" y2="60" stroke="#3b82f6" strokeWidth="2" />
            <line x1="30" y1="80" x2="70" y2="80" stroke="#3b82f6" strokeWidth="2" />
          </svg>
        </div>
        {/* Cell blob - top left */}
        <div className="absolute top-32 left-[5%] w-32 h-32 md:w-40 md:h-40 bg-green-200 dark:bg-green-900/30 rounded-full opacity-30 blur-2xl animate-float-slow" />
        {/* Mitochondria shape - bottom left */}
        <div className="absolute bottom-20 left-[15%] w-40 h-20 md:w-48 md:h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full opacity-25 blur-xl animate-float-slower" />
        {/* Molecule structure - bottom right */}
        <div className="absolute bottom-32 right-[20%] opacity-20 animate-float hidden md:block">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="20" r="8" fill="#f59e0b" />
            <circle cx="80" cy="50" r="8" fill="#f59e0b" />
            <circle cx="50" cy="80" r="8" fill="#f59e0b" />
            <circle cx="20" cy="50" r="8" fill="#f59e0b" />
            <line x1="50" y1="20" x2="80" y2="50" stroke="#f59e0b" strokeWidth="2" />
            <line x1="80" y1="50" x2="50" y2="80" stroke="#f59e0b" strokeWidth="2" />
            <line x1="50" y1="80" x2="20" y2="50" stroke="#f59e0b" strokeWidth="2" />
            <line x1="20" y1="50" x2="50" y2="20" stroke="#f59e0b" strokeWidth="2" />
          </svg>
        </div>
        {/* Abstract blob - right side */}
        <div className="absolute top-1/2 right-[8%] w-48 h-48 md:w-56 md:h-56 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl animate-float-slow" />
        {/* Small accent circle - left side */}
        <div className="absolute top-[45%] left-[8%] w-20 h-20 md:w-24 md:h-24 bg-orange-200 dark:bg-orange-900/30 rounded-full opacity-40 blur-xl animate-float-slower" />
      </div>

      <main className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24 md:mb-32">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Master Biology with
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI-Powered Concept Maps</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join university students who use BioBuddy to visualize complex biology concepts and ace their exams
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="/map"
              className="px-8 py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2 text-lg"
              aria-label="Start learning with BioBuddy"
            >
              Start Learning Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Features Cards - Podia style */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1 - AI Powered */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">🧠 AI-Powered</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Instant concept maps from your questions. Our AI understands biology and creates visual connections automatically.
              </p>
            </div>

            {/* Card 2 - Visual Maps */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">🎨 Visual Learning</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Complex topics become crystal clear. Interactive concept maps help you see the big picture and connections.
              </p>
            </div>

            {/* Card 3 - Study Anywhere */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">📚 Study Smarter</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Access your maps anytime, anywhere. Build your personal biology knowledge base and ace your exams.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
