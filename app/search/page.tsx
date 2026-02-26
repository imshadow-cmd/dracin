import { searchDramas } from '@/lib/api';
import { DramaSection } from '@/components/drama-section';
import { Header } from '@/components/header';
import { Search } from 'lucide-react';

interface SearchPageProps {
    searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q: query } = await searchParams;
    const results = query?.trim() ? await searchDramas(query.trim()).catch(() => []) : [];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="pb-24">
                <div className="px-6 md:px-12 pt-10 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Search className="w-5 h-5 text-primary" />
                        <h1 className="font-display text-3xl md:text-4xl font-bold">
                            {query ? `Hasil untuk "${query}"` : 'Cari Drama'}
                        </h1>
                    </div>
                    <p className="text-white/40 ml-8 text-sm">
                        {results.length > 0
                            ? `Ditemukan ${results.length} drama`
                            : query ? 'Tidak ada hasil yang ditemukan' : 'Ketik judul drama di kolom pencarian'
                        }
                    </p>
                </div>

                {results.length > 0 ? (
                    <DramaSection title="" dramas={results} />
                ) : (
                    <div className="flex flex-col items-center py-24 gap-4 text-center px-6">
                        <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center">
                            <Search className="w-7 h-7 text-white/20" />
                        </div>
                        <div>
                            <p className="text-white/50 text-base">
                                {query ? `Tidak ada drama dengan judul "${query}"` : 'Mulai ketik untuk mencari'}
                            </p>
                            {query && (
                                <p className="text-white/25 text-sm mt-1">
                                    Coba kata kunci yang berbeda atau lebih singkat
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
