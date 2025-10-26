"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api, type IssueDTO } from "@/lib/api"; // uses NEXT_PUBLIC_API_BASE
import IssueCard from "./IssueCard";

export default function IssueList() {
  const [data, setData] = useState<IssueDTO[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const res = await api.listIssues(); // -> GET {BASE}/api/issues
        if (!abort) {
          setData(res);
          setError(null);
        }
      } catch (e: any) {
        if (!abort) setError(e?.message || "Failed to load issues");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  if (loading) return <Card className="p-6">Loading issues…</Card>;
  if (error) return <Card className="p-6">Error: {error}</Card>;
  if (!data || data.length === 0) return <Card className="p-6">No issues yet.</Card>;

  return (
    <div className="space-y-4">
      {data.map((i) => (
        <IssueCard key={i.id} issue={i as any} />
      ))}
    </div>
  );
}
