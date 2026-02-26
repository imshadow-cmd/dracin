'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
    Maximize, Minimize, Settings, RotateCcw, Loader2,
    ChevronRight, X
} from 'lucide-react';

interface VideoPlayerProps {
    url: string;
    poster?: string;
    autoPlay?: boolean;
    episodeTitle?: string;
    episodeNumber?: number;
    totalEpisodes?: number;
    availableQualities?: { quality: number; videoPath: string }[];
    selectedQuality?: number | null;
    onQualityChange?: (quality: number) => void;
    onEnded?: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    hasPrev?: boolean;
    hasNext?: boolean;
}

function formatTime(s: number) {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function VideoPlayer({
    url, poster, autoPlay = true,
    episodeTitle, episodeNumber, totalEpisodes,
    availableQualities = [], selectedQuality, onQualityChange,
    onEnded, onPrev, onNext, hasPrev = false, hasNext = false
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<NodeJS.Timeout | null>(null);
    const nextFiredRef = useRef(false); // guard: prevent onNext firing twice

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showAutoNext, setShowAutoNext] = useState(false);
    const [autoNextCountdown, setAutoNextCountdown] = useState(5);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 3000);
    }, [playing]);

    // Load new URL
    useEffect(() => {
        const v = videoRef.current;
        if (!v || !url) return;
        setLoading(true);
        setShowAutoNext(false);
        setAutoNextCountdown(5);
        nextFiredRef.current = false; // reset guard for new episode
        v.load();
        if (autoPlay) v.play().catch(() => {});
    }, [url, autoPlay]);

    // Auto-next countdown
    useEffect(() => {
        if (!showAutoNext) return;
        if (autoNextCountdown <= 0) {
            if (!nextFiredRef.current) {
                nextFiredRef.current = true;
                onNext?.();
            }
            return;
        }
        const t = setTimeout(() => setAutoNextCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [showAutoNext, autoNextCountdown, onNext]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const v = videoRef.current;
            if (!v) return;
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
            switch (e.key) {
                case ' ': case 'k': e.preventDefault(); togglePlay(); break;
                case 'ArrowRight': e.preventDefault(); if (isFinite(v.duration)) v.currentTime = Math.min(v.currentTime + 10, v.duration); break;
                case 'ArrowLeft': e.preventDefault(); if (isFinite(v.duration)) v.currentTime = Math.max(v.currentTime - 10, 0); break;
                case 'ArrowUp': e.preventDefault(); v.volume = Math.min(v.volume + 0.1, 1); setVolume(v.volume); break;
                case 'ArrowDown': e.preventDefault(); v.volume = Math.max(v.volume - 0.1, 0); setVolume(v.volume); break;
                case 'm': toggleMute(); break;
                case 'f': toggleFullscreen(); break;
                case 'n': if (hasNext) onNext?.(); break;
                case 'p': if (hasPrev) onPrev?.(); break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [hasPrev, hasNext]);

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) v.play().catch(() => {});
        else v.pause();
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };

    const toggleFullscreen = () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const v = videoRef.current;
        const bar = progressRef.current;
        if (!v || !bar) return;
        const rect = bar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (isFinite(v.duration)) v.currentTime = ratio * v.duration;
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = videoRef.current;
        if (!v) return;
        const val = parseFloat(e.target.value);
        v.volume = val;
        v.muted = val === 0;
        setVolume(val);
        setMuted(val === 0);
    };

    const handleSpeedChange = (rate: number) => {
        const v = videoRef.current;
        if (!v) return;
        v.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 group"
            onMouseMove={resetHideTimer}
            onMouseLeave={() => playing && setShowControls(false)}
            onTouchStart={resetHideTimer}
        >
            <video
                ref={videoRef}
                className="w-full h-full"
                poster={poster}
                playsInline
                onClick={togglePlay}
                onPlay={() => { setPlaying(true); resetHideTimer(); }}
                onPause={() => { setPlaying(false); setShowControls(true); }}
                onTimeUpdate={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    setCurrentTime(v.currentTime);
                    if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
                    // Show auto-next when 5s remaining (only once, only if not already shown)
                    if (hasNext && v.duration > 0 && !isNaN(v.duration) && v.duration - v.currentTime <= 5 && !showAutoNext && !nextFiredRef.current) {
                        setShowAutoNext(true);
                    }
                }}
                onLoadedMetadata={() => {
                    const v = videoRef.current;
                    if (v) setDuration(v.duration);
                }}
                onCanPlay={() => setLoading(false)}
                onWaiting={() => setLoading(true)}
                onEnded={() => {
                    setPlaying(false);
                    // If no next episode, call onEnded callback
                    // If has next but auto-next didn't fire yet (e.g. very short video), trigger it once
                    if (!hasNext) {
                        onEnded?.();
                    } else if (!nextFiredRef.current) {
                        nextFiredRef.current = true;
                        onNext?.();
                    }
                }}
            >
                <source src={url} type="video/mp4" />
            </video>

            {/* Loading spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
            )}

            {/* Big play/pause center click indicator */}
            {!playing && !loading && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                >
                    <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                    </div>
                </div>
            )}

            {/* Auto-next overlay */}
            {showAutoNext && hasNext && (
                <div className="absolute top-4 right-4 glass-dark rounded-xl p-3 border border-white/10 flex items-center gap-3 z-20">
                    <div className="text-sm text-white/80">
                        <p className="font-semibold text-white">Episode Berikutnya</p>
                        <p className="text-xs text-white/50">Otomatis dalam {autoNextCountdown}s</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setShowAutoNext(false); if (hideTimer.current) clearTimeout(hideTimer.current); }}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => {
                                if (!nextFiredRef.current) {
                                    nextFiredRef.current = true;
                                    onNext?.();
                                }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/80 text-white text-xs font-bold transition-colors flex items-center gap-1"
                        >
                            Lanjut <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Controls overlay */}
            <div
                className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)' }}
            >
                {/* Episode info top */}
                {episodeTitle && (
                    <div className="absolute top-3 left-4 right-4 flex items-center justify-between">
                        <div>
                            <p className="text-white font-semibold text-sm drop-shadow">{episodeTitle}</p>
                            {episodeNumber && totalEpisodes && (
                                <p className="text-white/50 text-xs">Ep {episodeNumber} / {totalEpisodes}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Bottom controls */}
                <div className="px-4 pb-3 space-y-2">
                    {/* Progress bar */}
                    <div
                        ref={progressRef}
                        className="relative h-1 hover:h-2.5 transition-all duration-150 cursor-pointer rounded-full bg-white/20 group/progress"
                        onClick={handleProgressClick}
                    >
                        {/* Buffered */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                            style={{ width: `${bufferedPct}%` }}
                        />
                        {/* Played */}
                        <div
                            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Thumb */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity -translate-x-1/2"
                            style={{ left: `${progress}%` }}
                        />
                    </div>

                    {/* Buttons row */}
                    <div className="flex items-center gap-2">
                        {/* Prev episode */}
                        <button
                            onClick={onPrev}
                            disabled={!hasPrev}
                            className={`p-1.5 rounded-lg transition-all ${hasPrev ? 'text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed'}`}
                            title="Episode Sebelumnya (P)"
                        >
                            <SkipBack className="w-5 h-5" />
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
                            title="Play/Pause (K)"
                        >
                            {playing
                                ? <Pause className="w-6 h-6 fill-white" />
                                : <Play className="w-6 h-6 fill-white" />
                            }
                        </button>

                        {/* Next episode */}
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className={`p-1.5 rounded-lg transition-all ${hasNext ? 'text-white hover:bg-white/10' : 'text-white/20 cursor-not-allowed'}`}
                            title="Episode Berikutnya (N)"
                        >
                            <SkipForward className="w-5 h-5" />
                        </button>

                        {/* Rewind 10s */}
                        <button
                            onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }}
                            className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-all hidden sm:block"
                            title="Mundur 10 detik (←)"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Time */}
                        <span className="text-white/80 text-xs font-mono ml-1 hidden sm:block">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Volume */}
                        <div className="flex items-center gap-1.5 group/vol">
                            <button onClick={toggleMute} className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-all" title="Mute (M)">
                                {muted || volume === 0
                                    ? <VolumeX className="w-4 h-4" />
                                    : <Volume2 className="w-4 h-4" />
                                }
                            </button>
                            <input
                                type="range"
                                min="0" max="1" step="0.05"
                                value={muted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover/vol:w-20 transition-all duration-300 accent-primary h-1 cursor-pointer hidden sm:block"
                                style={{ accentColor: 'var(--color-primary)' }}
                            />
                        </div>

                        {/* Resolution */}
                        {availableQualities.length > 1 && (
                            <div className="relative">
                                <button
                                    onClick={() => { setShowQualityMenu(s => !s); setShowSpeedMenu(false); }}
                                    className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-bold min-w-[3rem] text-center flex items-center gap-1"
                                    title="Kualitas video"
                                >
                                    <span>{selectedQuality ? `${selectedQuality}p` : 'Auto'}</span>
                                </button>
                                {showQualityMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 glass-dark rounded-xl border border-white/10 overflow-hidden z-30 min-w-[80px]">
                                        <div className="px-3 py-1.5 text-[10px] text-white/30 font-semibold uppercase tracking-wider border-b border-white/5">
                                            Kualitas
                                        </div>
                                        {availableQualities.map(q => (
                                            <button
                                                key={q.quality}
                                                onClick={() => { onQualityChange?.(q.quality); setShowQualityMenu(false); }}
                                                className={`flex items-center justify-between w-full px-3 py-2 text-sm transition-colors gap-3 ${
                                                    selectedQuality === q.quality
                                                        ? 'bg-primary text-white'
                                                        : 'text-white/80 hover:bg-white/10'
                                                }`}
                                            >
                                                <span className="font-medium">{q.quality}p</span>
                                                {q.quality >= 720 && (
                                                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                                                        selectedQuality === q.quality ? 'bg-white/20' : 'bg-white/10 text-white/50'
                                                    }`}>HD</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Speed */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowSpeedMenu(s => !s); setShowQualityMenu(false); }}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all text-xs font-bold min-w-[2.5rem] text-center"
                                title="Kecepatan putar"
                            >
                                {playbackRate}x
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 glass-dark rounded-xl border border-white/10 overflow-hidden z-30">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => handleSpeedChange(r)}
                                            className={`block w-full px-4 py-2 text-sm text-left transition-colors ${
                                                playbackRate === r ? 'bg-primary text-white' : 'text-white/80 hover:bg-white/10'
                                            }`}
                                        >
                                            {r}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-all"
                            title="Fullscreen (F)"
                            onMouseDown={(e) => {
                                document.addEventListener('fullscreenchange', () => {
                                    setFullscreen(!!document.fullscreenElement);
                                }, { once: true });
                            }}
                        >
                            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
