"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Sarah J.',
    role: 'Learned Python • Taught Graphic Design',
    text: '"PeerLift completely changed how I learn. I traded my design skills for Python lessons and built my first app within a month!"',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 2,
    name: 'David K.',
    role: 'Learned Spanish • Taught React.js',
    text: '"Finding a language partner who also wanted to learn coding was a game-changer. We motivate each other every week."',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 3,
    name: 'Elena M.',
    role: 'Learned Marketing • Taught SEO',
    text: '"The community here is incredibly supportive. I leveled up my marketing skills without spending a dime on expensive courses."',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg'
  }
];

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto overflow-hidden py-12 bg-white/95 backdrop-blur-sm rounded-[32px] mt-12 px-6 lg:px-12 shadow-2xl">
      <div className="flex justify-center items-center min-h-[300px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center px-4 w-full"
          >
            <div className="relative w-20 h-20 rounded-full bg-neutral-200 text-white flex items-center justify-center overflow-hidden mb-6 shadow-[var(--shadow-glow-primary)] ring-4 ring-primary-50">
              <Image 
                src={testimonials[currentIndex].avatarUrl} 
                alt={testimonials[currentIndex].name} 
                fill 
                className="object-cover" 
                sizes="80px"
              />
            </div>
            <p className="text-xl md:text-[22px] font-display font-medium text-neutral-800 max-w-2xl mb-8 italic leading-relaxed">
              {testimonials[currentIndex].text}
            </p>
            <h4 className="font-bold text-neutral-900 text-lg">{testimonials[currentIndex].name}</h4>
            <p className="text-sm font-medium text-neutral-500 mt-2">{testimonials[currentIndex].role}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center gap-3 mt-8 pb-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'bg-primary-500 w-8' : 'bg-neutral-300 hover:bg-neutral-400'
            }`}
            aria-label={`Go to testimonial ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
