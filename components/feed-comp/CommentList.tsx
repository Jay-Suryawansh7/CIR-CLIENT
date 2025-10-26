// components/feed-comp/CommentList.tsx
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle } from "lucide-react"
import Image from "next/image"

export type FeedComment = {
  id?: string // ← make optional to match varied backends
  issueId: string
  authorName: string
  authorAvatar?: string | null
  text: string
  createdAt: string | Date
  // some backends may send _id instead
  _id?: string
}

function formatRelative(dt: string | Date) {
  const d = typeof dt === "string" ? new Date(dt) : dt
  const diff = Date.now() - d.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const dyy = Math.floor(h / 24)
  if (dyy < 7) return `${dyy}d ago`
  return d.toLocaleDateString()
}

export function CommentList({
  issueId,
  count,
  version = 0,
  fetchComments,
  className,
}: {
  issueId: string
  count: number
  /** Bump this to refresh while open after new comment is posted. */
  version?: number
  /** Must return latest comments for this issue. */
  fetchComments: (issueId: string) => Promise<FeedComment[]>
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<FeedComment[] | null>(null)
  const reqIdRef = useRef(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const id = ++reqIdRef.current
    try {
      const data = await fetchComments(issueId)
      if (reqIdRef.current === id) setComments(data)
    } catch (e: unknown) {
      if (reqIdRef.current === id) {
        const msg = e instanceof Error ? e.message : "Failed to load comments"
        setError(msg)
      }
    } finally {
      if (reqIdRef.current === id) setLoading(false)
    }
  }, [issueId, fetchComments])

  useEffect(() => {
    if (open && comments == null && !loading) void load()
  }, [open, comments, loading, load])

  useEffect(() => {
    if (open) void load()
  }, [open, version, load])

  const body = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-3 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="flex gap-3" key={`skeleton-${i}`}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-[40%]" />
                <Skeleton className="h-3 w-[80%]" />
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (error) {
      return (
        <div className="p-3 text-sm text-destructive">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="secondary" onClick={load}>
              Retry
            </Button>
          </div>
        </div>
      )
    }
    if (!comments || comments.length === 0) {
      return <div className="p-3 text-sm text-muted-foreground">No comments yet.</div>
    }
    return (
      <ScrollArea className="h-72">
        <ul className="divide-y">
          {comments.map((c, idx) => {
            const key =
              c.id ||
              c._id ||
              `${c.issueId}:${
                typeof c.createdAt === "string" ? c.createdAt : (c.createdAt as Date).toISOString()
              }:${idx}`
            return (
              <li key={key} className="p-3 flex gap-3">
                {c.authorAvatar ? (
                  <Image
                    src={c.authorAvatar}
                    alt={c.authorName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
                    {c.authorName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{c.authorName}</span>
                    <span>•</span>
                    <span>{formatRelative(c.createdAt)}</span>
                  </div>
                  <p className="text-sm breakwords">{c.text}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    )
  }, [comments, error, loading, load])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={className}
          aria-label="Show comments"
          title="Show comments"
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          {count}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-[360px] p-0">
        <div className="border-b px-3 py-2 text-sm font-medium">Comments</div>
        {body}
      </PopoverContent>
    </Popover>
  )
}
