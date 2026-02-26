import { fetchLatest } from '@/lib/api';
import { DramaSection } from '@/components/drama-section';
import { Header } from '@/components/header';
import { Clock } from 'lucide-react';

export default async function LatestPage() {
    const dramas = await fetchLatest().catch(() => []);
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pb-24 pt-6">
                <div className="px-6 md:px-12 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="font-display text-4xl md:text-5xl font-bold">Latest Releases</h1>
                        <p className="text-white/40 text-sm mt-0.5">{dramas.length} fresh dramas just dropped</p>
                    </div>
                </div>
                <DramaSection title="" dramas={dramas} />
            </main>
        </div>
    );
}
