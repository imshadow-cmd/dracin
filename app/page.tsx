import { fetchForYou, fetchLatest, fetchTrending } from '@/lib/api';
import { DramaSection } from '@/components/drama-section';
import { Header } from '@/components/header';
import { HeroCarousel } from '@/components/hero-carousel';

export default async function Home() {
  const [forYou, latest, trending] = await Promise.all([
    fetchForYou().catch(() => []),
    fetchLatest().catch(() => []),
    fetchTrending().catch(() => []),
  ]);

  const herosDramas = [...trending.slice(0, 3), ...forYou.slice(0, 2)].filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pb-24">
        <HeroCarousel dramas={herosDramas} />

        <div className="relative z-10 -mt-8 md:-mt-16 space-y-2 md:space-y-4 overflow-x-hidden">
          <DramaSection title="✦ For You" dramas={forYou} horizontal viewAllHref="/browse/foryou" />
          <DramaSection title="🔥 Trending Now" dramas={trending} horizontal viewAllHref="/browse/trending" />
          <DramaSection title="🆕 Latest Releases" dramas={latest} viewAllHref="/browse/latest" />
        </div>
      </main>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 inset-x-0 z-50 glass-dark border-t border-white/5 md:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { href: '/', label: 'Home', emoji: '🏠' },
            { href: '/browse/trending', label: 'Hot', emoji: '🔥' },
            { href: '/browse/latest', label: 'New', emoji: '✨' },
            { href: '/browse/foryou', label: 'For You', emoji: '💫' },
          ].map(item => (
            <a key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-1 px-4 text-white/50 hover:text-white transition-colors">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
