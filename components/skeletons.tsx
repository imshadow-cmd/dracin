export function DramaPlayerSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="w-full aspect-video bg-white/5 rounded-xl" />
            <div className="p-6 space-y-3">
                <div className="h-8 bg-white/5 rounded-lg w-2/3" />
                <div className="h-4 bg-white/5 rounded-lg w-full" />
                <div className="h-4 bg-white/5 rounded-lg w-3/4" />
                <div className="flex gap-2 mt-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-12 w-16 bg-white/5 rounded-lg shrink-0" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DramaGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 px-4 md:px-12">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[2/3] bg-white/5 rounded-xl" />
                    <div className="h-3 bg-white/5 rounded mt-2 w-3/4" />
                </div>
            ))}
        </div>
    );
}
