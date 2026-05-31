"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/badge";

type FavoriteToggleProps = {
  courseId: string;
  initialFavorited?: boolean;
};

export function FavoriteToggle({ courseId, initialFavorited = false }: FavoriteToggleProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          const response = await fetch("/api/user/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId })
          });

          if (!response.ok) return;
          const payload = (await response.json()) as { favorited: boolean };
          setFavorited(payload.favorited);
        })
      }
      className="inline-flex"
      disabled={pending}
    >
      <Badge tone={favorited ? "official" : "neutral"}>
        {pending ? "Saving..." : favorited ? "Bookmarked" : "Bookmark class"}
      </Badge>
    </button>
  );
}
