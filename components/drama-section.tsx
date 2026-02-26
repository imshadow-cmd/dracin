"use client"

import { DramaBook } from '@/lib/types';
import { DramaCard } from './drama-card';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface DramaSectionProps {
    title: string;
    dramas: DramaBook[];
    horizontal?: boolean;
    viewAllHref?: string;
}

export function DramaSection({ title, dramas, horizontal = false, viewAllHref }: DramaSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const validDramas = dramas?.filter(d =>
        d && d.bookId && d.bookName
    ) || [];

    if (!validDramas.length) return null;

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = 600;
        el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
        setTimeout(() => {
            if (el) {
                setCanScrollLeft(el.scrollLeft > 0);
                setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
            }
        }, 400);
    };

    return (
        <section className="py-3 md:py-5 space-y-3 group/section">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 md:px-12">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                        {title}
                    </h2>
                    {viewAllHref && (
                        <Link href={viewAllHref} className="flex items-center gap-0.5 text-xs text-primary font-medium opacity-0 group-hover/section:opacity-100 transition-all hover:gap-1.5">
                            See all <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    )}
                </div>
                
                {horizontal && (
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`w-8 h-8 rounded-lg glass flex items-center justify-center transition-all ${
                                canScrollLeft ? 'text-white/80 hover:text-white border border-white/10 hover:border-white/25' : 'text-white/20 cursor-not-allowed'
                            }`}
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`w-8 h-8 rounded-lg glass flex items-center justify-center transition-all ${
                                canScrollRight ? 'text-white/80 hover:text-white border border-white/10 hover:border-white/25' : 'text-white/20 cursor-not-allowed'
                            }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {horizontal ? (
                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="overflow-x-auto overflow-y-visible scrollbar-hide"
                        onScroll={(e) => {
                            const el = e.currentTarget;
                            setCanScrollLeft(el.scrollLeft > 0);
                            setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
                        }}
                    >
                        <div className="flex space-x-3 md:space-x-4 px-4 md:px-12 pb-4 pt-2">
                            {validDramas.map((drama, i) => (
                                <div key={drama.bookId} className="w-[130px] md:w-[160px] lg:w-[180px] shrink-0">
                                    <DramaCard drama={drama} index={i} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Fade edges */}
                    {canScrollLeft && <div className="absolute left-0 top-0 bottom-4 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />}
                    {canScrollRight && <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 px-4 md:px-12 py-2">
                    {validDramas.map((drama, i) => (
                        <DramaCard key={drama.bookId} drama={drama} index={i} />
                    ))}
                </div>
            )}
        </section>
    );
}
