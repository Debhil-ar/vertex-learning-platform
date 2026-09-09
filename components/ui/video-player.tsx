"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { getYouTubeEmbedUrl } from "@/lib/video";

// Minimal shape of the bits of the YouTube IFrame Player API this file
// uses. The full type lives in a global script loaded at runtime.
interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        options: {
          events: {
            onStateChange: (event: YTPlayerEvent) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const COMPLETION_THRESHOLD = 0.9;

interface VideoPlayerProps {
  videoUrl: string;
  startSeconds?: number;
  lessonSlug: string;
  lessonTitle: string;
  courseSlug: string;
  className?: string;
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

export function VideoPlayer({
  videoUrl,
  startSeconds,
  lessonSlug,
  lessonTitle,
  courseSlug,
  className,
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasFiredPlay = useRef(false);
  const hasFiredCompletion = useRef(false);

  const embedUrl = getYouTubeEmbedUrl(videoUrl, { startSeconds });

  useEffect(() => {
    if (!embedUrl || !iframeRef.current) return;

    let player: YTPlayer | null = null;
    let cancelled = false;

    function captureProgress(target: YTPlayer) {
      const duration = target.getDuration();
      if (!duration) return;
      const percentWatched = Math.round((target.getCurrentTime() / duration) * 100);
      posthog.capture("video_progress", {
        lesson_slug: lessonSlug,
        lesson_title: lessonTitle,
        course_slug: courseSlug,
        percent_watched: percentWatched,
      });

      if (!hasFiredCompletion.current && target.getCurrentTime() / duration >= COMPLETION_THRESHOLD) {
        hasFiredCompletion.current = true;
        posthog.capture("lesson_completed", {
          lesson_slug: lessonSlug,
          lesson_title: lessonTitle,
          course_slug: courseSlug,
        });
      }
    }

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !window.YT || !iframeRef.current) return;

      player = new window.YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event) => {
            const YT = window.YT;
            if (!YT) return;

            if (event.data === YT.PlayerState.PLAYING && !hasFiredPlay.current) {
              hasFiredPlay.current = true;
              posthog.capture("video_played", {
                lesson_slug: lessonSlug,
                lesson_title: lessonTitle,
                course_slug: courseSlug,
              });
            }

            if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
              captureProgress(event.target);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
    };
    // Only wire the player up once per mounted video.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [embedUrl]);

  if (!embedUrl) {
    return (
      <div className={className}>
        <p className="p-6 text-body text-neutral-500">This video can&apos;t be played.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={lessonTitle}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
