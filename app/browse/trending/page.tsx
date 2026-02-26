import { fetchTrending } from '@/lib/api';
import { DramaSection } from '@/components/drama-section';
import { Header } from '@/components/header';
import { Flame } from 'lucide-react';

export default async function TrendingPage() {
    const dramas = await fetchTrending().catch(() => []);
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pb-24 pt-6">
                <div className="px-6 md:px-12 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/20 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold">Trending Now</h1>
                        <p className="text-white/40 text-sm mt-0.5">{dramas.length} dramas on fire right now</p>
                    </div>
                </div>
                <DramaSection title="" dramas={dramas} />
            </main>
        </div>
    );
}
