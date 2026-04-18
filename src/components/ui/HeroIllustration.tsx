"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Code, ArrowLeftRight, PenTool, Globe, Briefcase, BookOpen, Music, Camera, Cpu, Layout } from "lucide-react";
import { useRef, useState } from "react";

export function HeroIllustration() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<1 | 2 | null>(null);
  const isHovered = hoveredCard !== null;
  
  // Scroll-based parallax for the "pile up" effect
  const { scrollY } = useScroll();
  
  // As user scrolls down (0 -> 400px), cards move from their spread out state to a stacked "piled up" state in the center
  const card1X = useTransform(scrollY, [0, 400], [-100, -20]);
  const card1Y = useTransform(scrollY, [0, 400], [40, -10]);
  const card1R = useTransform(scrollY, [0, 400], [-8, -4]);

  const card2X = useTransform(scrollY, [0, 400], [100, 20]);
  const card2Y = useTransform(scrollY, [0, 400], [-40, 10]);
  const card2R = useTransform(scrollY, [0, 400], [8, 4]);

  // The swap indicator fades and shrinks out of the way as they physically trade places/pile up
  const centerScale = useTransform(scrollY, [0, 300], [1, 0.4]);
  const centerOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center perspective-1000">
      
      {/* --- Ambient Organic Backgrounds (Breathing) --- */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-4 md:right-16 w-72 h-72 md:w-96 md:h-96 bg-primary-400/50 dark:bg-primary-500/20 rounded-full filter blur-[100px] z-0 pointer-events-none"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 left-0 md:left-12 w-72 h-72 md:w-[28rem] md:h-[28rem] bg-green-400/50 dark:bg-green-500/20 rounded-full filter blur-[100px] z-0 pointer-events-none"
      />

      {/* --- Floating Ecosystem Badges --- */}
      {/* 1. UI/UX Design */}
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: "spring" }} className="absolute top-4 left-2 md:top-8 md:-left-4 lg:left-12 z-0 hidden sm:block">
        <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-4 py-3 md:px-5 md:py-2.5 flex items-center gap-2.5">
             <PenTool size={16} className="text-blue-500" />
             <span className="text-xs font-bold text-text-primary">UI/UX Design</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. Spanish */}
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, type: "spring" }} className="absolute bottom-8 right-2 md:bottom-12 md:-right-4 lg:right-12 z-0 hidden sm:block">
        <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-4 py-3 md:px-5 md:py-2.5 flex items-center gap-2.5">
             <Globe size={16} className="text-pink-500" />
             <span className="text-xs font-bold text-text-primary">Spanish</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 3. Business */}
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: "spring" }} className="absolute top-20 right-8 md:top-12 md:right-16 lg:right-28 z-0 hidden md:block">
        <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-4 py-3 md:px-5 md:py-2.5 flex items-center gap-2.5">
             <Briefcase size={16} className="text-amber-500" />
             <span className="text-xs font-bold text-text-primary">Business</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 4. Guitar */}
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4, type: "spring" }} className="absolute top-[55%] left-1 md:top-[60%] md:-left-4 lg:left-6 z-0 hidden sm:block">
        <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-4 py-3 md:px-5 md:py-2.5 flex items-center gap-2.5">
             <Music size={16} className="text-purple-500" />
             <span className="text-xs font-bold text-text-primary">Guitar</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 5. Photography */}
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6, type: "spring" }} className="absolute top-[45%] right-0 md:top-[40%] md:-right-8 lg:right-4 z-0 hidden lg:block">
        <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-4 py-3 md:px-5 md:py-2.5 flex items-center gap-2.5">
             <Camera size={16} className="text-teal-500" />
             <span className="text-xs font-bold text-text-primary">Photography</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 6. AI/ML */}
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8, type: "spring" }} className="absolute bottom-8 left-[30%] md:-bottom-2 md:left-[35%] lg:left-[40%] z-0 hidden md:block">
        <motion.div animate={{ y: [8, -8, 8] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-4 py-3 md:px-5 md:py-2.5 flex items-center gap-2.5">
             <Cpu size={16} className="text-indigo-500" />
             <span className="text-xs font-bold text-text-primary">AI/ML</span>
          </div>
        </motion.div>
      </motion.div>

      {/* 7. Frontend */}
      <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.0, type: "spring" }} className="absolute -top-2 left-[40%] md:-top-4 md:left-[45%] z-0 hidden lg:block">
        <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}>
          <div className="bg-bg-elevated/95 backdrop-blur-xl border border-border shadow-xl rounded-full px-4 py-3 md:px-5 md:py-2.5 flex items-center gap-2.5">
             <Layout size={16} className="text-orange-500" />
             <span className="text-xs font-bold text-text-primary">Frontend</span>
          </div>
        </motion.div>
      </motion.div>

      {/* --- Main Interactive Swap Elements --- */}

      {/* Left Card: Alex Offering Python */}
      <motion.div style={{ x: card1X, y: card1Y, rotate: card1R }} className={`absolute ${hoveredCard === 1 ? 'z-40' : 'z-20'}`}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.2 }}
          whileHover={{ scale: 1.03 }}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
          className="bg-bg-elevated border border-border shadow-xl rounded-[24px] p-6 md:p-8 w-[280px] md:w-[340px]"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              I Teach
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
              <Code size={20} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="font-display font-extrabold text-3xl md:text-4xl mb-2 text-text-primary text-center tracking-tight">Python</h3>
          <p className="text-text-muted text-xs md:text-sm text-center mb-6">Data Science & APIs</p>
          
          <div className="flex items-center gap-3 pt-5 border-t border-border">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-bg-secondary overflow-hidden shrink-0">
              <img src="https://i.pravatar.cc/150?img=12" alt="Alex" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm md:text-base font-bold text-text-primary leading-tight">Alex (You)</div>
              <div className="text-[11px] md:text-xs text-text-muted font-medium">Advanced Level</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Card: Sam Offering Marketing */}
      <motion.div style={{ x: card2X, y: card2Y, rotate: card2R }} className={`absolute ${hoveredCard === 2 ? 'z-40' : 'z-20'}`}>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.4 }}
          whileHover={{ scale: 1.03 }}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
          className="bg-bg-elevated border border-border shadow-xl rounded-[24px] p-6 md:p-8 w-[280px] md:w-[340px]"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
              I Want to Learn
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="font-display font-extrabold text-3xl md:text-4xl mb-2 text-text-primary text-center tracking-tight">Marketing</h3>
          <p className="text-text-muted text-xs md:text-sm text-center mb-6">Growth & Social Media</p>
          
          <div className="flex items-center gap-3 pt-5 border-t border-border">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-bg-secondary overflow-hidden shrink-0">
              <img src="https://i.pravatar.cc/150?img=32" alt="Sam" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-sm md:text-base font-bold text-text-primary leading-tight">Sam</div>
              <div className="text-[11px] md:text-xs text-text-muted font-medium">Pro Mentor</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Center Glow & Swap Pivot */}
      <motion.div style={{ opacity: centerOpacity, scale: centerScale }} className="absolute z-30 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: isHovered ? 0.5 : 1, 
            rotate: 0,
            opacity: isHovered ? 0 : 1
          }}
          transition={{ type: "spring", bounce: 0.5, duration: 1.5, delay: isHovered ? 0 : 0.5 }}
          className="absolute flex items-center justify-center"
        >
          {/* Animated orbit ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full border-[2px] border-dashed border-primary-500/40"
          />
          {/* Pulsing Trade Button */}
          <motion.div 
            whileHover={{ scale: 1.15 }}
            className="bg-primary-500 text-white w-[56px] h-[56px] md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] cursor-pointer relative z-10"
          >
             <ArrowLeftRight size={26} strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </motion.div>

    </div>
  );
}
