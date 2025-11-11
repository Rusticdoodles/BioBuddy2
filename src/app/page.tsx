import { Navbar } from "@/components/navbar";
import Image from "next/image";
import {
  Dna,
  Microscope,
  Beaker,
  Brain,
  Activity,
  Syringe,
  Tablets,
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
          <div className="z-999 absolute top-20 right-[10%] w-24 h-24 md:w-32 md:h-32 opacity-20 animate-float">
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
          <div className="z-999 absolute rotate-25 top-60 left-[10%] w-24 h-24 md:w-32 md:h-32 opacity-20 animate-float-slow">
            <Dna className="w-40 h-40 text-blue-600"/>
          </div>
          {/*Brain - bottom right*/}
          <div className="z-999 absolute rotate-32 top-120 right-[25%] w-24 h-24 md:w-32 md:h-32 opacity-20 animate-float-slower">
            <Brain className="w-25 h-25 text-blue-600"/>
          </div>

          {/* Cell blob - top left */}
          <div className="z-999 absolute top-32 left-[5%] w-32 h-32 md:w-40 md:h-40 bg-green-200 dark:bg-green-900/30 rounded-full opacity-30 blur-2xl animate-float-slow" />
          {/* Mitochondria shape - bottom left */}
          <div className="z-999 absolute bottom-20 left-[15%] w-40 h-20 md:w-48 md:h-24 bg-purple-200 dark:bg-purple-900/30 rounded-full opacity-25 blur-xl animate-float-slower" />
          {/* Molecule structure - bottom right */}
          <div className="z-999 absolute bottom-32 right-[20%] opacity-20 animate-float hidden md:block">
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
          <div className="z-999 absolute top-1/2 right-[8%] w-48 h-48 md:w-56 md:h-56 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl animate-float-slow" />
          {/* Small accent circle - left side */}
          <div className="z-999 absolute top-[45%] left-[8%] w-20 h-20 md:w-24 md:h-24 bg-orange-200 dark:bg-orange-900/30 rounded-full opacity-40 blur-xl animate-float-slower" />
        </div>

        <main className="w-screen bg-neutral-100 mx-auto py-16 md:py-24 relative z-10">
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
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Card 1 - AI Powered */}
              <div className="z-100 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform duration-300">
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
              <div className="z-100 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-8 rounded-2xl border-2 border-green-200 dark:border-green-800 hover:scale-105 transition-transform duration-300">
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
              <div className="z-100 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform duration-300">
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
        <div 
            className="absolute inset-x-0 bottom-0 h-60 bg-white dark:bg-slate-900 z-1" 
            style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}
          />   
        </main>
        {/*---------------------------------------------------------------------------------------------------------------------------------------------- */}
        {/* Life Science Tailored AI */}
        <section className="mx-auto max-w-screen-2xl w-full rounded-3xl bg-white px-6 py-20 dark:bg-slate-900">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Illustration */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-lg rounded-[48px] bg-amber-200/70 p-12 shadow-xl dark:bg-amber-900/30">
                {/* Floating Shapes */}
                <Dna className="pointer-events-none absolute -top-8 -right-6 h-16 w-16"/>
                <Pill className="pointer-events-none absolute -bottom-9 left-12 h-14 w-14 rotate-90"/>
                <div aria-hidden="true" className="pointer-events-none absolute -top-8 left-10 h-14 w-14 rotate-30 rounded-xl bg-amber-400/80 dark:bg-amber-400/90" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 right-8 h-20 w-20 rounded-full bg-amber-500/60 blur-xl dark:bg-amber-400/60" />

                {/* Main Card */}
                <div className="relative rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-950">
                  <Image
                    src="/assets/AI-BioBrain.png"
                    alt="AI-powered biology illustration"
                    width={512}
                    height={512}
                    className="mx-auto h-auto w-full max-w-sm"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-6 mr-30">
              <p className="text-md font-semibold uppercase tracking-[0.4em] text-slate-500">understand</p>
              <h2 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white">Life Science Tailored AI</h2>
              <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Complete with images and academic sources, our AI agent are trained specifically to help you better understand life science related topics.
              </p>
            </div>
          </div>
        </section>

        {/*Automatic Tailored Maps*/}
        <section className="mx-auto max-w-screen-2xl w-full rounded-3xl bg-white px-6 py-20 dark:bg-slate-900">
          <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Copy */}
              <div className="space-y-6 ml-30">
                <p className="text-md font-semibold uppercase tracking-[0.4em] text-slate-500">conceptualize</p>
                <h2 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white">Auto-Tailored Maps</h2>
                <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                  Have completely customised mindmaps that is tailored to what you are learning that you can play around with and edit. 
                </p>
              </div>
              {/* Illustration */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-lg rounded-[48px] bg-amber-200/70 p-12 shadow-xl dark:bg-amber-900/30">
                {/* Floating Shapes */}
                <Syringe className="pointer-events-none absolute -bottom-10 right-8 h-16 w-16"/>
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-0 h-14 w-14 rotate-12 rounded-2xl bg-purple-900/90 dark:bg-white/80" />
                <Bone className="pointer-events-none absolute -top-10 left-10 h-16 w-16"/>
                <div aria-hidden="true" className="pointer-events-none absolute -top-8 -right-6 h-20 w-20 rounded-full bg-purple-500/60 blur-xl dark:bg-amber-400/60" />

                {/* Main Card */}
                <div className="relative rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-950">
                <Image
                    src="/assets/Mindmap2.png"
                    alt="AI-powered biology illustration"
                    width={512}
                    height={512}
                    className="mx-auto h-auto w-full max-w-sm"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/*Automatic Customised Flashcards*/}
        <section className="mx-auto max-w-screen-2xl w-full rounded-3xl bg-white px-6 py-20 dark:bg-slate-900">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Illustration */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-lg rounded-[48px] bg-amber-200/70 p-12 shadow-xl dark:bg-amber-900/30">
                {/* Floating Shapes */}
                <Microscope className="pointer-events-none absolute -top-8 -right-6 h-16 w-16 rotate-340"/>
                <Beaker className="pointer-events-none absolute -bottom-9 left-8 h-20 w-16 rotate-30"/>
                <div aria-hidden="true" className="pointer-events-none absolute -top-8 left-10 h-14 w-14 rotate-30 rounded-xl bg-green-200/80 dark:bg-amber-400/90" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 right-8 h-20 w-20 rounded-full bg-green-300/60 blur-xl dark:bg-amber-400/60" />

                {/* Main Card */}
                <div className="relative rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-950">
                  <Image
                      src="/assets/Flashcards2.png"
                      alt="AI-powered biology illustration"
                      width={512}
                      height={512}
                      className="mx-auto h-auto w-full max-w-sm"
                      priority
                    />
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-6 mr-30">
              <p className="text-md font-semibold uppercase tracking-[0.4em] text-slate-500">coming soon</p>
              <h2 className="text-5xl font-bold leading-tight text-slate-900 dark:text-white">Auto-Tailored Flashcards</h2>
              <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Gone are the days where you have to spend hours creating a custom deck. Be able to save Anki flashcards with just a click of a button based off what you are learning, so you can hone your memorisation game.
              </p>
            </div>
          </div>
        </section>
        {/*----------------------------------------------------------------------------------------------------------------------------------- */}
                {/* Finale Hero + Footer */}
                <section className="relative w-screen mt-16 overflow-hidden bg-gradient-to-b from-sky-200 via-sky-200 to-sky-300 pb-24 pt-32 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 -translate-y-1/2 rounded-full bg-sky-100/70 blur-3xl dark:bg-slate-700/60" />       
          <div 
            className="absolute inset-x-0 top-0 h-24 bg-white dark:bg-slate-900" 
            style={{ clipPath: 'ellipse(50% 100% at 50% 0%)' }}
          />   
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-16">
            
            {/* Floating accents */}
            <div aria-hidden="true" className="pointer-events-none">
              <div className="z-999 absolute left-9 top-10 h-16 w-16 -rotate-12 rounded-2xl bg-white/70 shadow-lg dark:bg-white/10" />
              <div className="z-999 absolute right-6 top-12 h-20 w-20 rotate-6 rounded-full bg-slate-900/70 shadow-lg dark:bg-white/20" />
              <div className="z-999 absolute right-13 top-100 h-14 w-14 rotate-12 rounded-xl bg-white/80 shadow-md dark:bg-white/10" />
              <div className="z-999 absolute left-24 top-80 h-12 w-12 rotate-12 rounded-full bg-slate-900/70 shadow-md dark:bg-white/20" />
              <div className="z-999 absolute left-1/2 top-105 h-16 w-16 -translate-x-1/2 rotate-12 rounded-2xl bg-white/70 shadow-md dark:bg-white/10" />
            </div>

            {/* CTA Card */}
            <div className="relative w-full rounded-[48px] bg-white px-8 py-20 text-center shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10 sm:px-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white md:text-5xl">
                Earn Back More Time For Yourself
              </h2>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
                Rather than getting stuck studying the same topic over and over again, get through them in just a couple of minutes, so that you can win back more time in your day.
              </p>
              <a href="/map">
                <button
                  type="button"
                  className="mt-10 inline-flex items-center justify-center rounded-full bg-slate-900 px-10 py-3 text-base font-semibold text-white transition hover:-translate-y-1 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:outline-white"
                  aria-label="Get started with BioBuddy"
                >
                  Get started
                </button>
              </a>
            </div>

            {/* Footer Links */}
            <footer className="grid w-full gap-12 text-sm text-slate-700 dark:text-slate-300 md:grid-cols-6">
              <div className="col-span-2 flex flex-col gap-4">
                <span className="text-2xl font-semibold text-slate-900 dark:text-white">BioBuddy</span>
                <p className="max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  AI companions designed to help biology students learn faster with concept maps, flashcards, and adaptive coaching.
                </p>
              </div>

              {[
                {
                  title: "Platform",
                  links: ["Pricing"],
                },
                {
                  title: "BioBuddy",
                  links: ["About"],
                },
                {
                  title: "Support",
                  links: ["Contact"],
                },
              ].map(({ title, links }) => (
                <div key={title} className="space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</span>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="transition hover:text-slate-900 hover:underline dark:hover:text-white"
                          aria-label={link}
                        >
                          {link}
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
