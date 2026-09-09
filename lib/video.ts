// Seed content and the lesson schema store plain YouTube watch/share URLs
// (see AGENTS.md section 9 — Vimeo/Bunny aren't wired up yet since no
// ingestion or playback exists for them). This extracts the video id and
// builds the embed src the lesson page's iframe actually points at.
export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2] ?? null;
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(
  url: string,
  { startSeconds }: { startSeconds?: number } = {},
): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;

  const params = new URLSearchParams({
    enablejsapi: "1",
    rel: "0",
    modestbranding: "1",
  });
  if (startSeconds && startSeconds > 0) {
    params.set("start", String(Math.floor(startSeconds)));
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/** Parses and clamps the `?t=` query param used for the "start at second" contract (AGENTS.md section 7). */
export function parseStartSeconds(value: string | null | undefined): number | undefined {
  if (!value) return undefined;
  const seconds = Number.parseInt(value, 10);
  if (Number.isNaN(seconds) || seconds < 0) return undefined;
  return seconds;
}
