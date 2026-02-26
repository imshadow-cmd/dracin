'use client';

import Link from 'next/link';
import { Search, Flame, Clock, Sparkles, Home, Menu, X, Bell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setSearchOpen(false);
        }
    };

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/browse/trending', label: 'Trending', icon: Flame },
        { href: '/browse/latest', label: 'Latest', icon: Clock },
        { href: '/browse/foryou', label: 'For You', icon: Sparkles },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <>
            <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${
                scrolled ? 'glass border-b border-white/5 shadow-lg shadow-black/20' : 'bg-transparent'
            }`}>
                <div className="container flex h-16 items-center px-4 md:px-8 gap-4">
                    {/* Logo */}
                    <Link href="/" className="mr-4 shrink-0 group">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all">
                                <span className="text-white font-black text-sm">D</span>
                            </div>
                            <span className="font-display text-xl font-bold tracking-tight hidden sm:block">
                                <span className="text-gradient">Drama</span>
                                <span className="text-white/90">Box</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1 flex-1">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    isActive(href)
                                        ? 'text-white bg-white/10'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                                {isActive(href) && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2 ml-auto">
                        {/* Search - Desktop */}
                        <div className="relative hidden md:block">
                            <AnimatePresence>
                                {searchOpen ? (
                                    <motion.form
                                        initial={{ width: 40, opacity: 0 }}
                                        animate={{ width: 280, opacity: 1 }}
                                        exit={{ width: 40, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        onSubmit={handleSearch}
                                        className="flex items-center glass rounded-xl overflow-hidden"
                                    >
                                        <Search className="w-4 h-4 text-white/50 ml-3 shrink-0" />
                                        <input
                                            ref={searchRef}
                                            type="search"
                                            placeholder="Search dramas..."
                                            className="flex-1 bg-transparent text-white placeholder-white/30 text-sm px-3 py-2 outline-none"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onBlur={() => !query && setSearchOpen(false)}
                                        />
                                        {query && (
                                            <button type="button" onClick={() => setQuery('')} className="mr-2 text-white/40 hover:text-white">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </motion.form>
                                ) : (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => setSearchOpen(true)}
                                        className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notification bell */}
                        <button className="w-9 h-9 rounded-xl glass hidden md:flex items-center justify-center text-white/60 hover:text-white transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden w-9 h-9 rounded-xl glass flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-16 inset-x-0 z-40 glass-dark border-b border-white/5 p-4"
                    >
                        {/* Mobile search */}
                        <form onSubmit={handleSearch} className="flex items-center glass rounded-xl mb-3">
                            <Search className="w-4 h-4 text-white/50 ml-3" />
                            <input
                                type="search"
                                placeholder="Search dramas..."
                                className="flex-1 bg-transparent text-white placeholder-white/30 text-sm px-3 py-2.5 outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </form>
                        <div className="grid grid-cols-2 gap-2">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        isActive(href) ? 'bg-primary/20 text-primary border border-primary/20' : 'glass text-white/70 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
