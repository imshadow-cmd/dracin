import { DramaBook, Episode } from "./types";

const BASE_URL = "https://dramabox.sansekai.my.id/api/dramabox";

export async function fetchForYou(): Promise<DramaBook[]> {
  const res = await fetch(`${BASE_URL}/foryou`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch For You data");
  return res.json();
}

export async function fetchLatest(): Promise<DramaBook[]> {
  const res = await fetch(`${BASE_URL}/latest`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch Latest data");
  return res.json();
}

export async function fetchTrending(): Promise<DramaBook[]> {
  const res = await fetch(`${BASE_URL}/trending`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch Trending data");
  return res.json();
}

export async function searchDramas(query: string): Promise<DramaBook[]> {
  // Try the API search endpoint first
  try {
    const res = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // API search failed or returned empty, fall through to local search
  }

  // Fallback: fetch all lists and filter by title/tags locally
  const [forYou, latest, trending] = await Promise.all([
    fetchForYou().catch(() => [] as DramaBook[]),
    fetchLatest().catch(() => [] as DramaBook[]),
    fetchTrending().catch(() => [] as DramaBook[]),
  ]);

  // Deduplicate by bookId
  const seen = new Set<string>();
  const all: DramaBook[] = [];
  for (const drama of [...forYou, ...latest, ...trending]) {
    if (drama.bookId && !seen.has(drama.bookId)) {
      seen.add(drama.bookId);
      all.push(drama);
    }
  }

  // Filter by query (case-insensitive match on name or tags)
  const q = query.toLowerCase().trim();
  return all.filter((d) => {
    const nameMatch = d.bookName?.toLowerCase().includes(q);
    const tagMatch = d.tags?.some((t) => t.toLowerCase().includes(q));
    return nameMatch || tagMatch;
  });
}

export async function fetchAllEpisodes(bookId: string): Promise<Episode[]> {
  const res = await fetch(`${BASE_URL}/allepisode?bookId=${bookId}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch episodes");
  return res.json();
}
