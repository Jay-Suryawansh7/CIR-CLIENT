"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import IssueDetailsDialog from "./IssueDetailsDialog";
import type { IssueDTO } from "@/lib/api";

export default function IssueCard({ issue }: { issue: IssueDTO }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Card className="p-4 flex gap-4 items-start">
        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={issue.title}
            src={issue.image}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{issue.id}</span>
              <h3 className="text-base sm:text-lg font-semibold">{issue.title}</h3>
              {issue.status && <Badge variant="secondary">{issue.status}</Badge>}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : ""}
            </div>
          </div>

          {issue.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {issue.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline">Comment</Button>
            <Button size="sm" onClick={() => setOpen(true)}>View</Button>
          </div>
        </div>
      </Card>

      {/* Details dialog */}
      <IssueDetailsDialog issue={issue} open={open} onOpenChange={setOpen} />
    </>
  );
}
