import { Navbar } from "@/components/navbar";
import Image from "next/image";
import {
  Dna,
  Microscope,
  Beaker,
  Brain,
  Syringe,
  Bone,
  Pill,
} from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 relative overflow-hidden">
      <Navbar />

        {/* Decorative floating shapes - biology themed */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* DNA Helix - top right */}
          <div className="z-49 absolute top-20 right-[10%] w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 opacity-20 dark:opacity-80 animate-float hidden sm:block">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M30 10 Q 40 30, 30 50 T 30 90" stroke="#3b82f6" strokeWidth="3" fill="none" />
              <path d="M70 10 Q 60 30, 70 50 T 70 90" stroke="#3b82f6" strokeWidth="3" fill="none" />
              <line x1="30" y1="20" x2="70" y2="20" stroke="#3b82f6" strokeWidth="2" />
              <line x1="30" y1="40" x2="70" y2="40" stroke="#3b82f6" strokeWidth="2" />
              <line x1="30" y1="60" x2="70" y2="60" stroke="#3b82f6" strokeWidth="2" />
              <line x1="30" y1="80" x2="70" y2="80" stroke="#3b82f6" strokeWidth="2" />
            </svg>
          </div>
          {/*DNA Helix - left side*/}
          <div className="z-49 absolute rotate-25 top-60 left-[10%] w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 opacity-20 dark:opacity-80 animate-float-slow hidden sm:block">
            <Dna className="w-full h-full text-purple-600"/>
          </div>
          {/*Brain - bottom right*/}
          <div className="z-49 absolute rotate-32 top-120 right-[25%] w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 opacity-20 dark:opacity-80 animate-float-slower hidden sm:block">
            <Brain className="w-full h-full text-orange-600"/>
          </div>

          {/* Cell blob - top left */}
          <div className="z-49 absolute top-32 left-[5%] w-20 h-20 sm:w-24 sm:h-24 md:w-40 md:h-40 bg-green-200 dark:bg-green-900/30 rounded-full opacity-30 blur-2xl animate-float-slow" />
          {/* Mitochondria shape - bottom left */}
          <div className="z-49 absolute bottom-20 left-[15%] w-24 h-12 sm:w-32 sm:h-16 md:w-48 md:h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full opacity-25 blur-xl animate-float-slower" />
          {/* Molecule structure - bottom right */}
          <div className="z-49 absolute bottom-32 right-[20%] opacity-20 animate-float hidden md:block">
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
          <div className="z-49 absolute top-1/2 right-[8%] w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl animate-float-slow" />
          {/* Small accent circle - left side */}
          <div className="z-49 absolute top-[45%] left-[8%] w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-orange-200 dark:bg-orange-900/30 rounded-full opacity-40 blur-xl animate-float-slower" />
        </div>

        <main className="w-screen bg-neutral-100 dark:bg-slate-800 mx-auto py-8 sm:py-12 md:py-24 relative z-10 px-4 sm:px-6">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-32">
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 leading-tight px-2">
              Your Dedicated
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Biology Study Buddy</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto px-2">
              Conceptualize, understand, and retain than better before. <br className="hidden sm:block"></br>
              <span className="font-semibold">Made by life science students, for life science students.</span>
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8">
              <a
                href="/map"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center gap-2 text-base sm:text-lg"
                aria-label="Start learning with BioBuddy"
              >
                Start Learning Free
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Features Cards - Podia style */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Card 1 - AI Powered */}
              <div className="z-49 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 sm:p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">🧠 AI-Powered</h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  Instant concept maps from your questions. Our AI understands biology and creates visual connections automatically.
                </p>
              </div>

              {/* Card 2 - Visual Maps */}
              <div className="z-49 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 sm:p-8 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:scale-105 transition-transform duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">🎨 Visual Learning</h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  Complex topics become crystal clear. Interactive concept maps help you see the big picture and connections.
                </p>
              </div>

              {/* Card 3 - Study Anywhere */}
              <div className="z-49 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 sm:p-8 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">📚 Study Smarter</h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  Access your maps anytime, anywhere. Build your personal biology knowledge base and ace your exams.
                </p>
              </div>
            </div>
        </div>
        <div 
            className="absolute inset-x-0 bottom-0 h-32 sm:h-48 md:h-60 bg-white dark:bg-slate-900 z-1" 
            style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}
          />   
        </main>
        {/*---------------------------------------------------------------------------------------------------------------------------------------------- */}
        {/* Life Science Tailored AI */}
        <section className="mx-auto max-w-screen-2xl w-full rounded-3xl bg-white px-4 sm:px-6 py-12 sm:py-16 md:py-20 dark:bg-slate-900">
          <div className="grid items-center gap-8 sm:gap-10 md:gap-12 md:grid-cols-2">
            {/* Illustration */}
            <div className="relative flex justify-center order-2 md:order-1">
              <div className="relative w-full max-w-lg rounded-2xl sm:rounded-[32px] md:rounded-[48px] bg-amber-200/70 p-6 sm:p-8 md:p-12 shadow-xl dark:bg-amber-900/30">
                {/* Floating Shapes */}
                <Dna className="pointer-events-none absolute -top-4 -right-3 sm:-top-6 sm:-right-4 md:-top-8 md:-right-6 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"/>
                <Pill className="pointer-events-none absolute -bottom-5 left-6 sm:-bottom-7 sm:left-8 md:-bottom-9 md:left-12 h-8 w-8 sm:h-10 sm:w-10 md:h-14 md:w-14 rotate-90"/>
                <div aria-hidden="true" className="pointer-events-none absolute -top-4 left-5 sm:-top-6 sm:left-8 md:-top-8 md:left-10 h-8 w-8 sm:h-10 sm:w-10 md:h-14 md:w-14 rotate-30 rounded-xl bg-amber-400/0 dark:bg-amber-400/20 border-2 border-amber-600" />
                <div aria-hidden="true" className="z-49 pointer-events-none absolute -bottom-5 right-4 sm:-bottom-7 sm:right-6 md:-bottom-10 md:right-8 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-amber-500/60 blur-xl dark:bg-amber-400/60" />

                {/* Main Card */}
                <div className="relative rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl dark:bg-slate-800">
                  <Image
                    src="/Assets/AI-Chat-light.png"
                    alt="AI-powered biology illustration"
                    width={512}
                    height={512}
                    className="mx-auto h-auto w-full max-w-xs sm:max-w-sm dark:hidden"
                    priority
                  />
                   <Image
                    src="/Assets/AI-Chat-dark.png"
                    alt="AI-powered biology illustration"
                    width={512}
                    height={512}
                    className="mx-auto h-auto w-full max-w-xs sm:max-w-sm hidden dark:block"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 md:order-2 text-center md:text-left">
              <p className="text-xs sm:text-sm md:text-md font-semibold uppercase tracking-[0.4em] text-slate-500">understand</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">Life Science Tailored AI</h2>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Complete with images and academic sources, our AI agent are trained specifically to help you better understand life science related topics.
              </p>
            </div>
          </div>
        </section>

        {/*Automatic Tailored Maps*/}
        <section className="mx-auto max-w-screen-2xl w-full rounded-3xl bg-white px-4 sm:px-6 py-12 sm:py-16 md:py-20 dark:bg-slate-900">
          <div className="grid items-center gap-8 sm:gap-10 md:gap-12 md:grid-cols-2">
              {/* Copy */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left">
                <p className="text-xs sm:text-sm md:text-md font-semibold uppercase tracking-[0.4em] text-slate-500">conceptualize</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">Auto-Tailored Maps</h2>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                  Have completely customised mindmaps created from your notes or from conversations with our AI that is tailored to what you are learning that you can play around with and edit. 
                </p>
              </div>
              {/* Illustration */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-lg rounded-2xl sm:rounded-[32px] md:rounded-[48px] bg-amber-200/70 p-6 sm:p-8 md:p-12 shadow-xl dark:bg-amber-900/30">
                {/* Floating Shapes */}
                <Syringe className="pointer-events-none absolute -bottom-5 right-4 sm:-bottom-7 sm:right-6 md:-bottom-10 md:right-8 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"/>
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-3 left-0 sm:-bottom-4 sm:left-2 md:-bottom-6 md:left-0 h-8 w-8 sm:h-10 sm:w-10 md:h-14 md:w-14 rotate-12 rounded-2xl bg-purple-900/60 dark:bg-purple-400/20 border-2 border-purple-600" />
                <Bone className="pointer-events-none absolute -top-5 left-5 sm:-top-7 sm:left-8 md:-top-10 md:left-10 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"/>
                <div aria-hidden="true" className="z-49 pointer-events-none absolute -top-4 -right-3 sm:-top-6 sm:-right-4 md:-top-8 md:-right-6 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-purple-500/60 blur-xl dark:bg-purple-400/60" />

                {/* Main Card */}
                <div className="relative rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl dark:bg-slate-800">
                <Image
                    src="/Assets/Mindmap-image-light.png"
                    alt="AI-powered biology illustration"
                    width={512}
                    height={512}
                    className="mx-auto h-auto w-full max-w-xs sm:max-w-sm dark:hidden"
                    priority
                  />
                  <Image
                    src="/Assets/Mindmap-image-dark.png"
                    alt="AI-powered biology illustration"
                    width={512}
                    height={512}
                    className="mx-auto h-auto w-full max-w-xs sm:max-w-sm hidden dark:block"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/*Automatic Customised Flashcards*/}
        <section className="mx-auto max-w-screen-2xl w-full rounded-3xl bg-white px-4 sm:px-6 py-12 sm:py-16 md:py-20 dark:bg-slate-900">
          <div className="grid items-center gap-8 sm:gap-10 md:gap-12 md:grid-cols-2">
            {/* Illustration */}
            <div className="relative flex justify-center order-2 md:order-1">
              <div className="relative w-full max-w-lg rounded-2xl sm:rounded-[32px] md:rounded-[48px] bg-amber-200/70 p-6 sm:p-8 md:p-12 shadow-xl dark:bg-amber-900/30">
                {/* Floating Shapes */}
                <Microscope className="pointer-events-none absolute -top-4 -right-3 sm:-top-6 sm:-right-4 md:-top-8 md:-right-6 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 rotate-340"/>
                <Beaker className="pointer-events-none absolute -bottom-5 left-4 sm:-bottom-7 sm:left-6 md:-bottom-9 md:left-8 h-12 w-10 sm:h-16 sm:w-12 md:h-20 md:w-16 rotate-30"/>
                <div aria-hidden="true" className="pointer-events-none absolute -top-4 left-5 sm:-top-6 sm:left-8 md:-top-8 md:left-10 h-8 w-8 sm:h-10 sm:w-10 md:h-14 md:w-14 rotate-30 rounded-xl bg-green-200/80 dark:bg-green-400/20 border-2 border-green-600" />
                <div aria-hidden="true" className="z-49 pointer-events-none absolute -bottom-5 right-4 sm:-bottom-7 sm:right-6 md:-bottom-10 md:right-8 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-green-300/60 blur-xl dark:bg-green-400/60" />

                {/* Main Card */}
                <div className="relative rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl dark:bg-slate-200">
                  <Image
                      src="/Assets/Flashcards2.png"
                      alt="AI-powered biology illustration"
                      width={512}
                      height={512}
                      className="mx-auto h-auto w-full max-w-xs sm:max-w-sm"
                      priority
                    />
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-4 sm:space-y-5 md:space-y-6 order-1 md:order-2 text-center md:text-left">
              <p className="text-xs sm:text-sm md:text-md font-semibold uppercase tracking-[0.4em] text-slate-500">coming soon</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">One-Click Flashcards</h2>
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Gone are the days where you have to spend hours creating a custom deck. Be able to save Anki flashcards with just a click of a button based off what you are learning, so you can hone your memorisation game.
              </p>
            </div>
          </div>
        </section>

                {/*Quizes*/}
                <section className="mx-auto max-w-screen-2xl w-full rounded-3xl bg-white px-4 sm:px-6 py-12 sm:py-16 md:py-20 dark:bg-slate-900">
          <div className="grid items-center gap-8 sm:gap-10 md:gap-12 md:grid-cols-2">
              {/* Copy */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6 text-center md:text-left">
                <p className="text-xs sm:text-sm md:text-md font-semibold uppercase tracking-[0.4em] text-slate-500">COMING SOON</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-slate-900 dark:text-white">Customized Quizzes</h2>
                <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                  Test your recall with fun and interactive quizzes that are designed around your content with just a few clicks. You&apos;ll be able to control the difficulty to your liking.
                </p>
              </div>
              {/* Illustration */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-lg rounded-2xl sm:rounded-[32px] md:rounded-[48px] bg-amber-200/70 p-6 sm:p-8 md:p-12 shadow-xl dark:bg-amber-900/30">
                {/* Floating Shapes */}
                <Syringe className="pointer-events-none absolute -bottom-5 right-4 sm:-bottom-7 sm:right-6 md:-bottom-10 md:right-8 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"/>
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-3 left-0 sm:-bottom-4 sm:left-2 md:-bottom-6 md:left-0 h-8 w-8 sm:h-10 sm:w-10 md:h-14 md:w-14 rotate-12 rounded-2xl bg-purple-900/60 dark:bg-purple-400/20 border-2 border-purple-600" />
                <Bone className="pointer-events-none absolute -top-5 left-5 sm:-top-7 sm:left-8 md:-top-10 md:left-10 h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16"/>
                <div aria-hidden="true" className="z-49 pointer-events-none absolute -top-4 -right-3 sm:-top-6 sm:-right-4 md:-top-8 md:-right-6 h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full bg-purple-500/60 blur-xl dark:bg-purple-400/60" />

                {/* Main Card */}
                <div className="relative rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 md:p-8 shadow-2xl dark:bg-slate-200">
                <Image
                    src="/Assets/Quiz.png"
                    alt="AI-powered biology illustration"
                    width={512}
                    height={512}
                    className="mx-auto h-auto w-full max-w-xs sm:max-w-sm"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/*----------------------------------------------------------------------------------------------------------------------------------- */}
                {/* Finale Hero + Footer */}
                <section className="relative w-screen mt-8 sm:mt-12 md:mt-16 overflow-hidden bg-gradient-to-b from-sky-200 via-sky-200 to-sky-300 pb-12 sm:pb-16 md:pb-24 pt-16 sm:pt-24 md:pt-32 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 px-4 sm:px-6">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24 sm:h-32 md:h-40 -translate-y-1/2 rounded-full bg-sky-100/70 blur-3xl dark:bg-slate-700/60" />       
          <div 
            className="absolute inset-x-0 top-0 h-12 sm:h-16 md:h-24 bg-white dark:bg-slate-900" 
            style={{ clipPath: 'ellipse(50% 100% at 50% 0%)' }}
          />   
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 sm:gap-12 md:gap-16">
            
            {/* Floating accents */}
            <div aria-hidden="true" className="pointer-events-none hidden md:block">
              <div className="z-49 absolute left-9 top-10 h-16 w-16 -rotate-12 rounded-2xl bg-blue-500 shadow-lg dark:bg-blue-400/20 border-2 border-blue-400" />
              <div className="z-49 absolute right-6 top-12 h-20 w-20 rotate-6 rounded-full bg-orange-500 shadow-lg dark:bg-orange-400/20 border-2 border-orange-400" />
              <div className="z-49 absolute right-13 top-100 h-14 w-14 rotate-12 rounded-xl bg-green-300 shadow-md dark:bg-green-300/20 border-2 border-green-400" />
              <div className="z-49 absolute left-24 top-80 h-12 w-12 rotate-12 rounded-full bg-purple-400 shadow-md dark:bg-purple-400/20 border-2 border-purple-400" />
              <div className="z-49 absolute left-1/2 top-105 h-16 w-16 -translate-x-1/2 rotate-12 rounded-2xl bg-red-200 shadow-md dark:bg-red-200/20 border-2 border-red-300" />
            </div>

            {/* CTA Card */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl md:rounded-[48px] bg-white px-6 sm:px-8 md:px-16 py-12 sm:py-16 md:py-20 text-center shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white">
                Earn Back Your Time
              </h2>
              <p className="mt-4 sm:mt-5 md:mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 px-2">
                Rather than getting stuck studying the same topic over and over again, get through them in just a couple of minutes, so that you can win back more time in your day.
              </p>
              <a href="/map">
                <button
                  type="button"
                  className="mt-6 sm:mt-8 md:mt-10 w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-blue-900/90 px-8 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white transition hover:-translate-y-1 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-white"
                  aria-label="Get started with BioBuddy"
                >
                  Get started
                </button>
              </a>
            </div>

            {/* Footer Links */}
            <footer className="grid w-full gap-8 sm:gap-10 md:gap-12 text-sm text-slate-700 dark:text-slate-300 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
              <div className="col-span-2 sm:col-span-3 md:col-span-2 flex flex-col gap-3 sm:gap-4">
                <span className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">BioBuddy</span>
                <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  AI companions designed to help biology students learn faster with concept maps, flashcards, and adaptive coaching.
                </p>
              </div>

              {[
                {
                  title: "Platform",
                  links: [{ name: "Pricing", href: "/pricing" }],
                },
                {
                  title: "BioBuddy",
                  links: [{ name: "About", href: "#" }],
                },
                {
                  title: "Support",
                  links: [{ name: "Contact", href: "/contact" }],
                },
                {
                  title: "Legal",
                  links: [
                    { name: "Privacy Policy", href: "/privacy-policy" },
                    { name: "Terms of Service", href: "/terms-of-service" },
                    { name: "Refund Policy", href: "/refund-policy" },
                  ],
                },
              ].map(({ title, links }) => (
                <div key={title} className="space-y-2 sm:space-y-3">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</span>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-xs sm:text-sm transition hover:text-slate-900 hover:underline dark:hover:text-white"
                          aria-label={link.name}
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </footer>
          </div>
        </section>
    </div>
  );
};

export default Home;
