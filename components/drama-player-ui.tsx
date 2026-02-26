'use client';

import { useState, useRef, useEffect } from 'react';
import { Episode } from '@/lib/types';
import { VideoPlayer } from '@/components/video-player';
import { Lock, ChevronLeft, ChevronRight, List, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DramaPlayerUIProps {
    bookId: string;
    bookName?: string;
    introduction?: string;
    episodes: Episode[];
}

export function DramaPlayerUI({ bookId, bookName, introduction, episodes }: DramaPlayerUIProps) {
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [showEpisodePanel, setShowEpisodePanel] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
    const activeEpRef = useRef<HTMLButtonElement>(null);

    const currentEpisode = episodes[currentEpisodeIndex];

    // Get available quality options for current episode
    const getAvailableQualities = (ep: Episode): { quality: number; videoPath: string }[] => {
        if (!ep?.cdnList?.length) return [];
        const cdn = ep.cdnList.find(c => c.videoPathList.some(v => v.isDefault)) || ep.cdnList[0];
        if (!cdn) return [];
        return cdn.videoPathList
            .filter(q => q.videoPath)
            .sort((a, b) => a.quality - b.quality);
    };

    const getVideoUrl = (ep: Episode, quality: number | null): string => {
        if (!ep?.cdnList?.length) return '';
        const cdn = ep.cdnList.find(c => c.videoPathList.some(v => v.isDefault)) || ep.cdnList[0];
        if (!cdn) return '';
        const qualities = cdn.videoPathList;
        if (quality !== null) {
            const match = qualities.find(q => q.quality === quality);
            if (match) return match.videoPath;
        }
        const defaultQ = qualities.find(q => q.isDefault === 1);
        const highQ = qualities.find(q => q.quality === 720) || qualities.find(q => q.quality === 480);
        return (defaultQ || highQ || qualities[0])?.videoPath || '';
    };

    const goToEpisode = (index: number) => {
        if (index < 0 || index >= episodes.length) return;
        setCurrentEpisodeIndex(index);
        // Keep selected quality when switching episodes, but validate it exists
    };

    const availableQualities = getAvailableQualities(currentEpisode);
    // Auto-pick best quality on first load or if selected quality not available
    const activeQuality = availableQualities.find(q => q.quality === selectedQuality)
        ? selectedQuality
        : availableQualities.find(q => q.quality === 720)?.quality
        ?? availableQualities.find(q => q.quality === 480)?.quality
        ?? availableQualities[availableQualities.length - 1]?.quality
        ?? null;

    // Scroll active episode into view when panel opens
    useEffect(() => {
        if (showEpisodePanel) {
            setTimeout(() => activeEpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    }, [showEpisodePanel]);

    const videoUrl = getVideoUrl(currentEpisode, activeQuality);
    const hasPrev = currentEpisodeIndex > 0;
    const hasNext = currentEpisodeIndex < episodes.length - 1;

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-5">
            {/* Player */}
            <VideoPlayer
                url={videoUrl}
                autoPlay={true}
                episodeTitle={currentEpisode?.chapterName || `Episode ${currentEpisodeIndex + 1}`}
                episodeNumber={currentEpisodeIndex + 1}
                totalEpisodes={episodes.length}
                hasPrev={hasPrev}
                hasNext={hasNext}
                availableQualities={availableQualities}
                selectedQuality={activeQuality}
                onQualityChange={(q) => setSelectedQuality(q)}
                onPrev={() => goToEpisode(currentEpisodeIndex - 1)}
                onNext={() => goToEpisode(currentEpisodeIndex + 1)}
            />

            {/* Info row */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-white truncate">
                        {bookName || 'Drama'}
                    </h1>
                    <div className="flex items-center flex-wrap gap-2 mt-1 text-sm text-white/50">
                        <span className="text-white/80 font-medium">
                            {currentEpisode?.chapterName || `Episode ${currentEpisodeIndex + 1}`}
                        </span>
                        <span>·</span>
                        <span>Ep {currentEpisodeIndex + 1} dari {episodes.length}</span>
                        {currentEpisode?.isCharge === 1 && (
                            <>
                                <span>·</span>
                                <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold border border-yellow-400/30 px-1.5 py-0.5 rounded-md">
                                    <Lock className="w-3 h-3" /> Premium
                                </span>
                            </>
                        )}
                    </div>
                    {introduction && (
                        <p className="mt-2 text-sm text-white/40 line-clamp-2 leading-relaxed">{introduction}</p>
                    )}
                </div>

                {/* Prev / Next episode buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => goToEpisode(currentEpisodeIndex - 1)}
                        disabled={!hasPrev}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                            hasPrev
                                ? "glass border border-white/10 text-white/70 hover:text-white hover:border-white/25"
                                : "glass border border-white/5 text-white/20 cursor-not-allowed"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                    </button>
                    <button
                        onClick={() => setShowEpisodePanel(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium glass border border-white/10 text-white/70 hover:text-white hover:border-white/25 transition-all"
                    >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline">Episode</span>
                    </button>
                    <button
                        onClick={() => goToEpisode(currentEpisodeIndex + 1)}
                        disabled={!hasNext}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                            hasNext
                                ? "bg-primary/90 hover:bg-primary text-white shadow-lg shadow-primary/20"
                                : "glass border border-white/5 text-white/20 cursor-not-allowed"
                        )}
                    >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Episode grid (inline, scrollable) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white/80">Daftar Episode</h2>
                    <span className="text-xs text-white/30">{episodes.length} episode</span>
                </div>
                <div className="overflow-x-auto scrollbar-thin pb-1">
                    <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
                        {episodes.map((ep, index) => {
                            const isActive = index === currentEpisodeIndex;
                            const isLocked = ep.isCharge === 1;
                            const isWatched = index < currentEpisodeIndex;

                            return (
                                <button
                                    key={ep.chapterId}
                                    ref={isActive ? activeEpRef : null}
                                    onClick={() => goToEpisode(index)}
                                    className={cn(
                                        "relative flex-shrink-0 w-16 h-11 rounded-xl overflow-hidden border transition-all",
                                        isActive
                                            ? "border-primary ring-2 ring-primary/40 scale-105"
                                            : isWatched
                                            ? "border-white/10 opacity-60 hover:opacity-100 hover:border-white/20"
                                            : "border-white/10 hover:border-white/25"
                                    )}
                                >
                                    {ep.chapterImg ? (
                                        <img src={ep.chapterImg} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className={cn(
                                            "w-full h-full flex items-center justify-center text-sm font-bold",
                                            isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-white/50"
                                        )}>
                                            {index + 1}
                                        </div>
                                    )}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <div className="w-1 h-3 bg-white rounded-full mx-0.5 animate-pulse" />
                                            <div className="w-1 h-5 bg-white rounded-full mx-0.5 animate-pulse" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-1 h-3 bg-white rounded-full mx-0.5 animate-pulse" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    )}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Lock className="w-3.5 h-3.5 text-yellow-400" />
                                        </div>
                                    )}
                                    {/* Episode number badge */}
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white/70 text-center py-0.5 font-medium">
                                        {index + 1}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Episode panel modal (for large list) */}
            <AnimatePresence>
                {showEpisodePanel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
                        onClick={() => setShowEpisodePanel(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="w-full md:max-w-2xl max-h-[80vh] glass-dark rounded-t-2xl md:rounded-2xl border border-white/10 overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                                <div>
                                    <h3 className="font-display text-lg font-bold text-white">Daftar Episode</h3>
                                    <p className="text-xs text-white/40">{episodes.length} episode · Sedang memutar Ep {currentEpisodeIndex + 1}</p>
                                </div>
                                <button onClick={() => setShowEpisodePanel(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="overflow-y-auto scrollbar-thin flex-1 p-3">
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {episodes.map((ep, index) => {
                                        const isActive = index === currentEpisodeIndex;
                                        const isLocked = ep.isCharge === 1;
                                        const isWatched = index < currentEpisodeIndex;
                                        return (
                                            <button
                                                key={ep.chapterId}
                                                ref={isActive ? activeEpRef : null}
                                                onClick={() => { goToEpisode(index); setShowEpisodePanel(false); }}
                                                className={cn(
                                                    "relative aspect-video rounded-xl overflow-hidden border transition-all",
                                                    isActive ? "border-primary ring-2 ring-primary/30" : isWatched ? "border-white/5 opacity-50 hover:opacity-80" : "border-white/10 hover:border-white/25"
                                                )}
                                            >
                                                {ep.chapterImg ? (
                                                    <img src={ep.chapterImg} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={cn("w-full h-full flex items-center justify-center text-sm font-bold", isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40")}>
                                                        {index + 1}
                                                    </div>
                                                )}
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center gap-0.5">
                                                        <div className="w-1 h-3 bg-white rounded-full animate-pulse" />
                                                        <div className="w-1 h-5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                                                        <div className="w-1 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                                                    </div>
                                                )}
                                                {isLocked && (
                                                    <div className="absolute top-1 right-1"><Lock className="w-3 h-3 text-yellow-400" /></div>
                                                )}
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center py-0.5 text-white/60">{index + 1}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
