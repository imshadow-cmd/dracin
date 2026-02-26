"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { DramaBook } from '@/lib/types';
import { PlayCircle, Plus, ThumbsUp, Star, Bookmark, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

interface DramaCardProps {
    drama: DramaBook;
    index?: number;
}

export function DramaCard({ drama, index = 0 }: DramaCardProps) {
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    if (!drama || !drama.bookId) return null;

    // Normalize cover URL - handle relative paths
    const coverUrl = drama.coverWap
        ? (drama.coverWap.startsWith('http') ? drama.coverWap : `https:${drama.coverWap}`)
        : null;

    const handleWishlist = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsWishlisted(prev => !prev);
    }, []);

    const handleLike = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked(prev => !prev);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="group relative w-full cursor-pointer card-shine"
            onClick={() => router.push(`/drama/${drama.bookId}`)}
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-card shadow-xl shadow-black/30 border border-white/5">
                {/* Skeleton */}
                {!imgLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
                )}
                
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={drama.bookName}
                        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgLoaded(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 p-2">
                        <span className="text-white/30 text-xs text-center line-clamp-3">{drama.bookName}</span>
                    </div>
                )}

                {/* Top badges */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                    <span className="glass-dark text-xs font-bold px-2 py-0.5 rounded-lg text-emerald-400 border border-emerald-400/20">
                        ★ 98%
                    </span>
                    {drama.chapterCount && (
                        <span className="glass-dark text-xs px-2 py-0.5 rounded-lg text-white/70">
                            {drama.chapterCount} Ep
                        </span>
                    )}
                </div>

                {/* Wishlist button (always visible on mobile, hover on desktop) */}
                <button
                    onClick={handleWishlist}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200
                        opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100
                        ${isWishlisted ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'glass-dark text-white/70 hover:text-white'}`}
                >
                    <Bookmark className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Bottom overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold text-white text-xs md:text-sm line-clamp-2 mb-2">
                        {drama.bookName}
                    </h3>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/drama/${drama.bookId}`); }}
                            className="flex-1 flex items-center justify-center gap-1 bg-white text-black rounded-lg py-1.5 text-xs font-bold hover:bg-white/90 transition-colors"
                        >
                            <PlayCircle className="w-3.5 h-3.5 fill-current" />
                            Play
                        </button>
                        <button
                            onClick={handleLike}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                isLiked ? 'bg-primary text-white' : 'glass text-white/70 hover:text-white'
                            }`}
                        >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Tags below card */}
            {drama.tags && drama.tags.length > 0 && (
                <p className="mt-1.5 px-0.5 text-xs text-white/40 truncate group-hover:text-white/60 transition-colors">
                    {drama.tags.slice(0, 2).join(' · ')}
                </p>
            )}
        </motion.div>
    );
}
