"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

export function ExploreFilters() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent scroll when mobile filters are open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const FilterContent = () => (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-extrabold text-text-primary tracking-tight">Filters</h2>
        <a href="/explore" className="text-sm text-primary-600 hover:text-primary-700 font-bold active:scale-95 transition-all">
          Clear all
        </a>
      </div>
      
      {/* Filter Sections */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        {/* Category section */}
        <details open className="group marker:content-['']">
          <summary className="font-bold text-base text-text-primary mb-4 cursor-pointer list-none flex justify-between items-center outline-none select-none hover:text-primary-600 transition-colors">
            Skill Category
            <ChevronDown size={18} className="text-text-muted transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-3.5 text-sm text-text-secondary pb-2 animate-in fade-in duration-200">
            {[
              { label: "Technical", color: "bg-blue-400" },
              { label: "Creative", color: "bg-purple-400" },
              { label: "Language", color: "bg-pink-400" },
              { label: "Academic", color: "bg-amber-400" },
              { label: "Lifestyle", color: "bg-emerald-400" }
            ].map((cat, index) => (
              <label key={index} className="flex items-center cursor-pointer group active:scale-[0.99] transition-transform">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-border-strong text-primary-500 focus:ring-primary-500/20 focus:ring-offset-0 transition-colors cursor-pointer" 
                /> 
                <span className="flex items-center gap-2.5 ml-3 font-medium group-hover:text-text-primary transition-colors">
                  <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`}></span>
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </details>

        <div className="h-px bg-border"></div>

        {/* Level Section */}
        <details open className="group marker:content-['']">
          <summary className="font-bold text-base text-text-primary mb-4 cursor-pointer list-none flex justify-between items-center outline-none select-none hover:text-primary-600 transition-colors">
            Skill Level
            <ChevronDown size={18} className="text-text-muted transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-3.5 text-sm text-text-secondary pb-2 animate-in fade-in duration-200">
            {["Any", "Beginner", "Intermediate", "Advanced"].map((level, index) => (
              <label key={index} className="flex items-center cursor-pointer group active:scale-[0.99] transition-transform">
                <input 
                  type="radio" 
                  name="lvl" 
                  defaultChecked={index === 0}
                  className="w-5 h-5 border-border-strong text-primary-500 focus:ring-primary-500/20 focus:ring-offset-0 transition-colors cursor-pointer" 
                /> 
                <span className="ml-3 font-medium group-hover:text-text-primary transition-colors">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </details>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Filters Sidebar */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col gap-10 p-8 border-r border-border bg-bg-elevated sticky top-0 h-[calc(100vh-64px)] overflow-y-auto">
        <FilterContent />
      </aside>

      {/* Mobile Floating Filters Trigger Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 md:hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-bold shadow-lg shadow-primary-500/20 active:scale-95 hover:scale-105 transition-all"
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile Filters Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/45 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-250"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Filters Slide-up Bottom Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 max-h-[85vh] bg-bg-elevated/98 backdrop-blur-md rounded-t-3xl border-t border-border z-50 shadow-2xl p-6 md:hidden flex flex-col transition-all duration-350 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Notch header */}
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-5 shrink-0" />
        
        {/* Close Button top right */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-full active:scale-90 transition-all"
        >
          <X size={18} />
        </button>

        <div className="flex-1 overflow-y-auto">
          <FilterContent />
        </div>

        {/* Apply button for mobile */}
        <div className="border-t border-border pt-4 mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-3.5 bg-primary-500 text-white font-bold text-sm rounded-xl active:scale-[0.98] transition-all shadow-md shadow-primary-500/10"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
