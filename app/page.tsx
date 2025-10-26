// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Navbar } from "@/components/feed-comp/Navbar";
import { FeedCard } from "@/components/feed-comp/FeedCard";
import { NewPostDialog } from "@/components/feed-comp/NewPostDialog";
import { api, IssueDTO } from "@/lib/api";
import { FloatingPostButton } from "@/components/feed-comp/FloatingPostButton";

/** Fisher–Yates shuffle (pure, returns new array) */
function shuffle<T>(input: T[]): T[] {
  const a = input.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Page() {
  const [issues, setIssues] = useState<IssueDTO[]>([]);
  const [displayIssues, setDisplayIssues] = useState<IssueDTO[]>([]);
  const [open, setOpen] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [shuffling, setShuffling] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const { getToken } = useAuth();

  // Fetch all issues
  useEffect(() => {
    api
      .listIssues()
      .then((data) => {
        setIssues(data);
        setDisplayIssues(shuffle(data)); // initial shuffle
      })
      .catch(console.error);
  }, []);

  // Debounced shuffle whenever the slider changes (or when the source list changes)
  useEffect(() => {
    if (!issues.length) return;

    // begin animation state
    setShuffling(true);

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    // tweak delay (200–400ms feels nice)
    debounceRef.current = window.setTimeout(() => {
      setDisplayIssues(shuffle(issues));
      // allow one more frame for fade-in to feel smooth
      window.requestAnimationFrame(() => setShuffling(false));
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [radiusKm, issues]);

  const onLike = async (id: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id && !i.userHasLiked ? { ...i, likes: i.likes + 1, userHasLiked: true } : i
      )
    );

    try {
      const token = await getToken();
      const { likes, userHasLiked } = await api.likeIssue(id, token!);
      setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, likes, userHasLiked } : i)));
    } catch {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, likes: Math.max(0, i.likes - 1), userHasLiked: false } : i
        )
      );
    }
  };

  const onComment = async (id: string, text: string) => {
    try {
      const token = await getToken();
      await api.addComment(id, text, token!);
      setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, comments: i.comments + 1 } : i)));
    } catch (e) {
      console.error(e);
    }
  };

  const onCreate = async (
    payload: Omit<IssueDTO, "id" | "likes" | "comments" | "createdAt" | "userHasLiked">
  ) => {
    const token = await getToken();
    const created = await api.createIssue(payload, token!);
    setIssues((prev) => [{ ...created, userHasLiked: false }, ...prev]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      {/* Header */}
      <header>
        <Navbar />
      </header>

      {/* Feed Container */}
      <main className="flex-1 px-4 md:px-6 py-6">
        <div className="mx-auto w-full md:w-3/5 xl:w-2/5">
          {/* Title + Distance control row */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">All Issues</h2>

            {/* Right-side distance slider */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-muted-foreground">Distance</span>
              <div className="flex items-center gap-2">
                <span className="w-12 text-right text-sm tabular-nums flex items-center justify-end gap-2">
                  {radiusKm} km
                  {shuffling && (
                    <span
                      className="inline-block h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-transparent"
                      aria-hidden="true"
                    />
                  )}
                </span>
                <Slider
                  value={[radiusKm]}
                  onValueChange={([v]) => setRadiusKm(v)} // triggers debounced shuffle
                  min={1}
                  max={50}
                  step={1}
                  className="w-36 sm:w-48"
                  aria-label="Distance radius in kilometers"
                />
              </div>
            </div>
          </div>

          <ScrollArea className="h-[80vh]">
            {/* Animated list wrapper */}
            <div
              className={[
                "flex flex-col gap-6 transition-all duration-300",
                shuffling ? "opacity-50 blur-[1px] scale-[0.995]" : "opacity-100 blur-0 scale-100",
              ].join(" ")}
            >
              {displayIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={[
                    "transition-transform duration-300",
                    shuffling ? "-translate-y-1" : "translate-y-0",
                  ].join(" ")}
                >
                  <FeedCard
                    issue={issue}
                    onLike={() => onLike(issue.id)}
                    onComment={(t) => onComment(issue.id, t)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </main>

      {/* Floating Post Button */}
      <FloatingPostButton onClick={() => setOpen(true)} />

      {/* New Post Dialog */}
      <NewPostDialog open={open} onOpenChange={setOpen} onCreate={onCreate} />
    </div>
  );
}
