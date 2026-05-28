 import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
// ─────────────────────────────────────────────────────────────
// src/components/sections/GetInTouch.tsx
// ─────────────────────────────────────────────────────────────
export function GetInTouch() {
  return (
    <section className="section bg-brand-600 overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      </div>
      <div className="container relative text-center">
        <p className="text-brand-200 text-sm font-semibold uppercase tracking-widest mb-4">
          Ready to Build?
        </p>
        <h2 className="section-headline text-white mb-6">
          Let's Turn Your Idea Into Reality
        </h2>
        <p className="text-brand-100 max-w-xl mx-auto mb-10 text-lg">
          Whether you have a detailed brief or just a rough concept, our team is ready to help you scope, plan, and build it right.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/contact" className="bg-white text-brand-700 font-semibold px-8 py-4 rounded-full hover:bg-brand-50 transition-colors text-sm flex items-center gap-2">
            Start a Project <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/projects" className="border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/10 transition-colors text-sm">
            View Our Work
          </Link>
        </div>
      </div>
    </section>
  )
}
 