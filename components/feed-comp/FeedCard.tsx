// components/feed-comp/FeedCard.tsx
"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  ThumbsUp,
  MapPin,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronDown,
  Pencil,
  Share2,
  Copy,
  Info,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CommentList } from "@/components/feed-comp/CommentList";
import { toast } from "sonner";
import type { Issue as BaseIssue } from "@/components/feed-comp/FeedList";

export type IssueStatus =
  | "NEW"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "ESCALATED"
  | "COMPLETED"
  | "REJECTED";

const STATUS_META = {
  NEW: { label: "New", icon: Clock, badgeClass: "bg-slate-100 text-slate-700" },
  ACKNOWLEDGED: { label: "Acknowledged", icon: ShieldCheck, badgeClass: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "In Progress", icon: Loader2, badgeClass: "bg-amber-100 text-amber-700" },
  ESCALATED: { label: "Escalated", icon: AlertTriangle, badgeClass: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Resolved", icon: CheckCircle2, badgeClass: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", icon: XCircle, badgeClass: "bg-red-100 text-red-700" },
} as const;

type Issue = BaseIssue & {
  userHasLiked?: boolean;
  status?: IssueStatus | string;
  commentsVersion?: number;
  id?: string;
  _id?: string;
  postId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

function StatusBadge({ status }: { status: IssueStatus }) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${meta.badgeClass}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

const TIMELINE: IssueStatus[] = ["IN_PROGRESS", "COMPLETED"];

export function FeedCard({
  issue,
  onLike,
  onComment,
  isAdmin = false,
  onUpdateStatus,
  onEdit,
}: {
  issue: Issue;
  onLike?: () => void;
  onComment?: (text: string) => void;
  isAdmin?: boolean;
  onUpdateStatus?: (next: IssueStatus) => void;
  onEdit?: () => void;
}) {
  const [text, setText] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const postId = issue.postId || issue.id || issue._id || "";
  const likeDisabled = !!issue.userHasLiked || !onLike;

  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
    const route = process.env.NEXT_PUBLIC_POST_ROUTE?.replace(/^\/|\/$/g, "") || "posts";
    return postId ? `${origin}/${route}/${postId}` : "";
  }, [postId]);

  const initialStatus: IssueStatus =
    (issue.status as IssueStatus) && STATUS_META[issue.status as IssueStatus]
      ? (issue.status as IssueStatus)
      : "NEW";
  const [liveStatus, setLiveStatus] = useState<IssueStatus>(initialStatus);

  useEffect(() => {
    const next: IssueStatus =
      (issue.status as IssueStatus) && STATUS_META[issue.status as IssueStatus]
        ? (issue.status as IssueStatus)
        : "NEW";
    setLiveStatus(next);
  }, [issue.status]);

  const sendComment = () => {
    const v = text.trim();
    if (!v) return;
    onComment?.(v);
    setText("");
  };

  const createdAt = issue.createdAt ? new Date(issue.createdAt) : null;
  const updatedAt = issue.updatedAt ? new Date(issue.updatedAt) : null;
  const fmt = (d: Date) =>
    d.toLocaleString(undefined, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  const activeIdx = TIMELINE.findIndex((s) => s === liveStatus);

  return (
    // ↓ Reduced overall width
    <Card className="w-full max-w-xl mx-auto overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative w-full h-60">
        <Image src={issue.image} alt={issue.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
        <div className="absolute left-3 top-3">
          <StatusBadge status={liveStatus} />
        </div>
      </div>

      <CardContent className="p-4 space-y-2">
        <h2 className="font-semibold text-base">{issue.title}</h2>
        <p className="text-sm text-muted-foreground">{issue.description}</p>

        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4 mr-1" />
          <span>
            {issue.location}
            {issue.ward ? ` • ${issue.ward}` : ""}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between text-sm mt-3 border-t pt-3 text-muted-foreground">
          {/* Left cluster: Like, Comments, Share */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
              onClick={onLike}
              disabled={likeDisabled}
              aria-label={issue.userHasLiked ? "You already liked this" : "Like"}
              title={issue.userHasLiked ? "You already liked this" : "Like"}
            >
              <ThumbsUp className="w-4 h-4" /> {issue.likes}
            </button>

            {postId ? (
              <CommentList
                issueId={postId}
                count={issue.comments}
                version={issue.commentsVersion ?? 0}
                fetchComments={async (id) => {
                  const BASE = process.env.NEXT_PUBLIC_API_BASE || "";
                  const res = await fetch(`${BASE}/api/issues/${id}/comments`);
                  if (!res.ok) throw new Error("Failed to fetch comments");
                  return res.json();
                }}
              />
            ) : (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> {issue.comments}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
              aria-label="Share post"
              title="Share post"
              disabled={!postId}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Right cluster: Info */}
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                  aria-label="More info"
                  title="More info"
                >
                  <Info className="w-4 h-4" />
                  Info
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Details</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {createdAt ? (
                        <>Created: <span className="text-foreground">{fmt(createdAt)}</span></>
                      ) : (
                        <>Created: <span className="text-foreground">Unknown</span></>
                      )}
                      {updatedAt ? (
                        <>
                          <br />
                          Updated: <span className="text-foreground">{fmt(updatedAt)}</span>
                        </>
                      ) : null}
                      <br />
                      Current Status: <span className="text-foreground">{STATUS_META[liveStatus].label}</span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <div className="text-sm font-medium mb-2">Status Timeline</div>
                    <ol className="relative border-l pl-3">
                      {TIMELINE.map((s, idx) => {
                        const active = idx === activeIdx;
                        const past = idx < activeIdx;
                        const IconC = STATUS_META[s].icon;
                        return (
                          <li key={s} className="mb-3 ml-1">
                            <span
                              className={[
                                "absolute -left-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full",
                                past ? "bg-primary/60" : active ? "bg-primary" : "bg-muted",
                              ].join(" ")}
                              aria-hidden="true"
                            />
                            <div className="flex items-center gap-2">
                              <IconC className="w-3.5 h-3.5" />
                              <span
                                className={[
                                  "text-xs",
                                  active || past ? "text-foreground" : "text-muted-foreground",
                                  active ? "font-semibold" : "",
                                ].join(" ")}
                              >
                                {STATUS_META[s].label}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {onComment && (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendComment()}
              aria-label="Add a comment"
            />
            <Button type="button" onClick={sendComment} aria-label="Send comment">
              Send
            </Button>
          </div>
        )}
      </CardContent>

      <AlertDialog open={shareOpen} onOpenChange={setShareOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share this post</AlertDialogTitle>
            <AlertDialogDescription>
              Copy the link below to share this post with others.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center gap-2 mt-3">
            <Input readOnly value={shareUrl} className="flex-1" />
            <Button
              variant="secondary"
              disabled={!shareUrl}
              onClick={() => {
                if (!shareUrl) return;
                navigator.clipboard.writeText(shareUrl);
                toast.success("Link copied to clipboard");
              }}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
