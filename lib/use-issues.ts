// lib/use-issues.ts
"use client";

import useSWR, { useSWRConfig } from "swr";
import { useEffect } from "react";

export type Issue = {
  _id?: string | number;
  id?: string | number;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  status?: string;
  createdAt?: string;
  [k: string]: any;
};

export const ISSUES_KEY = "/issues";

export function useIssues() {
  const { mutate } = useSWRConfig();

 
  const { data, error, isLoading } = useSWR<Issue[]>(
    ISSUES_KEY,
    async () => {
      const res = await fetch("/api/issues");
      if (!res.ok) throw new Error(`Failed to fetch issues: ${res.status}`);
      return (await res.json()) as Issue[];
    },
    { revalidateOnFocus: true }
  );
  // Realtime: subscribe to WS once
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      console.warn("WS init failed", e);
      return;
    }

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data ?? "{}");
        if (msg?.type === "issue:created" && msg.payload) {
          const incoming = msg.payload as Issue;
          mutate(
            ISSUES_KEY,
            (old?: Issue[]) => {
              if (!old) return [incoming];
              const exists = old.some(
                (i) => (i.id ?? i._id) === (incoming.id ?? incoming._id)
              );
              return exists ? old : [incoming, ...old];
            },
            false
          );
        }
      } catch (err) {
        console.error("WS message parse error", err);
      }
    };

    return () => {
      try { ws?.close(); } catch {}
    };
  }, [mutate]);

  return { issues: data, loading: isLoading, error };
}
