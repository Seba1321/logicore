const UNSPLASH_HOST = "images.unsplash.com";

/**
 * Optimizes Unsplash URLs by switching to WebP and the requested width.
 * Falls back to the original URL for non-Unsplash sources.
 */
export const optimizedImage = (url: string, width = 800): string => {
  if (!url.includes(UNSPLASH_HOST)) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fm", "webp");
    parsed.searchParams.set("q", "75");
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.delete("h");
    parsed.searchParams.set("fit", "crop");
    return parsed.toString();
  } catch {
    return url;
  }
};
