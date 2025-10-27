import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              BioBuddy Concept Map Generator
            </h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8 rounded-full"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Transform your lecture notes into visual concept maps. Paste your biology or medical notes and see connections between concepts automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a
              href="/map"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block text-center"
              aria-label="Get Started - Try the Concept Map Generator"
            >
              Try It Now
            </a>
            <button 
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-lg transition-colors duration-200"
              aria-label="Learn More - Coming Soon"
              disabled
            >
              Learn More
            </button>
          </div>
        </div>
        
        {/* Features Preview */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Smart Text Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Advanced AI analyzes your notes to identify key concepts and their relationships automatically.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Visual Concept Maps
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Generate beautiful, interactive concept maps that help you visualize complex biological relationships.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Enhanced Learning
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Improve your understanding and retention of complex biological concepts through visual learning.
              </p>
            </div>
          </div>
        </div>
        
        {/* Coming Soon Notice */}
        <div className="text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🚀 Development in Progress
            </h3>
            <p className="text-blue-700 dark:text-blue-200">
              We&apos;re building the future of biology education. Stay tuned for the launch of our concept mapping features!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
