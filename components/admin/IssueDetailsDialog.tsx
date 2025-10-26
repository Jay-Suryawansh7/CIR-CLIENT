"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type IssueDTO } from "@/lib/api";

type Props = {
  issue: IssueDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function IssueDetailsDialog({ issue, open, onOpenChange }: Props) {
  const created = issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "—";
  const reporter = issue.userId || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{issue.title}</DialogTitle>
            {issue.status && <Badge variant="secondary">{issue.status}</Badge>}
          </div>
          <DialogDescription className="mt-1">
            Detailed context for this reported civic issue.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="grid md:grid-cols-5 gap-6 p-6">
          {/* Left: Image */}
          <div className="md:col-span-2">
            <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={issue.title}
                src={issue.image}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Right: Facts */}
          <div className="md:col-span-3 space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium">{issue.location || "—"}</div>
              {!!issue.ward && <div className="text-sm text-muted-foreground mt-0.5">Ward: {issue.ward}</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Likes</div>
                <div className="text-lg font-semibold">{issue.likes ?? 0}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Comments</div>
                <div className="text-lg font-semibold">{issue.comments ?? 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Reporter</div>
                <div className="font-medium">{reporter}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">{created}</div>
              </div>
            </div>

            {(issue.category || issue.aiSummary) && (
              <div className="space-y-2">
                {issue.category && (
                  <div>
                    <div className="text-sm text-muted-foreground">AI Category</div>
                    <div className="font-medium">{issue.category}</div>
                  </div>
                )}
                {issue.aiSummary && (
                  <div>
                    <div className="text-sm text-muted-foreground">AI Summary</div>
                    <div className="text-sm">{issue.aiSummary}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Description scroll area */}
        <div className="p-6 pt-4">
          <div className="text-sm text-muted-foreground mb-1.5">Description</div>
          <ScrollArea className="max-h-48 rounded-md">
            <p className="text-sm leading-relaxed">{issue.description || "—"}</p>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
