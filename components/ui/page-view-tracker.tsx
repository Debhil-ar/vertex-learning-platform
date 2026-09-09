"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface PageViewTrackerProps {
  event: string;
  properties?: Record<string, unknown>;
}

export function PageViewTracker({ event, properties }: PageViewTrackerProps) {
  useEffect(() => {
    posthog.capture(event, properties);
    // Only fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
