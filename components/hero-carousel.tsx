"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroDrama } from './hero-drama';
import { DramaBook } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
    dramas: DramaBook[];
}

export function HeroCarousel({ dramas }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const validDramas = dramas.filter(d => d && d.bookId && d.coverWap && d.bookName);

    useEffect(() => {
        if (!validDramas.length || isPaused) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % validDramas.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [validDramas.length, isPaused]);

    if (!validDramas.length) return null;

    const prev = () => setCurrentIndex(i => (i - 1 + validDramas.length) % validDramas.length);
    const next = () => setCurrentIndex(i => (i + 1) % validDramas.length);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    <HeroDrama drama={validDramas[currentIndex]} />
                </motion.div>
            </AnimatePresence>

            {/* Prev/Next arrows */}
            {validDramas.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl glass-dark border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 z-10"
                        style={{ opacity: undefined }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl glass-dark border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-12 flex items-center gap-2 z-10">
                {validDramas.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`transition-all duration-300 rounded-full ${
                            i === currentIndex
                                ? 'w-6 h-1.5 bg-primary'
                                : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                        }`}
                    />
                ))}
            </div>

            {/* Progress bar */}
            {!isPaused && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10 z-10">
                    <motion.div
                        key={currentIndex}
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 7, ease: 'linear' }}
                    />
                </div>
            )}
        </div>
    );
}
