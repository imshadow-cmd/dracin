'use client';

import Link from 'next/link';
import { Play, Info, Bookmark, ChevronRight } from 'lucide-react';
import { DramaBook } from '@/lib/types';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface HeroDramaProps {
    drama: DramaBook;
}

export function HeroDrama({ drama }: HeroDramaProps) {
    const [wishlisted, setWishlisted] = useState(false);

    if (!drama) return null;

    return (
        <div className="relative w-full h-[60vh] md:h-[75vh] lg:h-[88vh] overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src={drama.coverWap}
                    alt={drama.bookName}
                    className="w-full h-full object-cover object-top scale-105"
                    style={{ filter: 'brightness(0.55)' }}
                />
                {/* Multi-layer gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
                {/* Ambient color glow */}
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-end md:items-center">
                <div className="w-full px-6 md:px-12 lg:px-16 pb-16 md:pb-0">
                    <motion.div
                        className="max-w-lg space-y-4"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                    >
                        {/* Genre tag */}
                        {drama.tags && drama.tags[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <span className="w-1 h-4 bg-primary rounded-full block" />
                                <span className="text-xs font-medium uppercase tracking-widest text-primary/90">
                                    {drama.tags[0]}
                                </span>
                            </motion.div>
                        )}

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
                        >
                            {drama.bookName}
                        </motion.h1>

                        {/* Meta info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center gap-3 text-sm"
                        >
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                <span className="text-base">★</span> 98% Match
                            </span>
                            {drama.chapterCount && (
                                <span className="text-white/60">{drama.chapterCount} Episodes</span>
                            )}
                            {drama.playCount && (
                                <span className="text-white/60">{drama.playCount} views</span>
                            )}
                            {drama.tags && drama.tags.slice(1, 3).map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-md border border-white/20 text-white/60 text-xs">
                                    {tag}
                                </span>
                            ))}
                        </motion.div>

                        {/* Description */}
                        {drama.introduction && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-sm md:text-base text-white/70 line-clamp-2 leading-relaxed"
                            >
                                {drama.introduction}
                            </motion.p>
                        )}

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-3 pt-1"
                        >
                            <Link href={`/drama/${drama.bookId}`}>
                                <button className="btn-glow flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-white/95 transition-all shadow-xl shadow-white/10 hover:shadow-white/20">
                                    <Play className="w-5 h-5 fill-current" />
                                    Watch Now
                                </button>
                            </Link>
                            <button
                                onClick={() => setWishlisted(!wishlisted)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all glass border ${
                                    wishlisted
                                        ? 'border-primary/40 text-primary bg-primary/10'
                                        : 'border-white/15 text-white/80 hover:border-white/30 hover:text-white'
                                }`}
                            >
                                <Bookmark className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                                {wishlisted ? 'Saved' : 'Save'}
                            </button>
                            <Link href={`/drama/${drama.bookId}`}>
                                <button className="w-12 h-12 rounded-xl glass border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-all">
                                    <Info className="w-4 h-4" />
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
