"use client";

import { useMemo, useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import IssueList from "@/components/admin/IssueList";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type Status = "all" | "open" | "in-progress" | "resolved";

export default function AdminIssuesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("all");

  const statusTabs = useMemo(
    () => [
      { key: "all" as Status, label: "All" },
      { key: "open" as Status, label: "Open" },
      { key: "in-progress" as Status, label: "In-progress" },
      { key: "resolved" as Status, label: "Resolved" },
    ],
    []
  );

  const onExportCSV = () => {
    alert("Exporting CSV… (connect this to your API)");
  };

  const onOpenHeatmap = () => {
    alert("Opening city heatmap… (connect to route/modal)");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-[11px] uppercase tracking-widest text-gray-400">CIR</span>
            <span className="text-sm font-semibold text-gray-900">By People</span>
            <span className="text-xs text-gray-400">• Data for demo only</span>
          </div>

          {/* Right-side controls */}
          <div className="flex items-center gap-2">
            {/* PROFILE POPOVER */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  aria-haspopup="dialog"
                  aria-label="Open profile"
                >
                  Profile
                </button>
              </PopoverTrigger>

              <PopoverContent
  align="center"
  sideOffset={12}
  className="w-[300px] sm:w-[340px] p-0 rounded-lg shadow-xl border bg-white text-[11px] leading-tight"
>
  {/* Inner container */}
  <div className="p-4">
    <div className="flex items-start justify-between">
      <h3 className="text-[13px] font-semibold text-gray-900">My Profile</h3>
      <button
        className="text-gray-400 hover:text-gray-600 text-[14px] leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>

    {/* Profile details */}
    <div className="mt-4 space-y-4">
      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
          Officer Name
        </div>
        <div className="mt-0.5 text-[12px] font-semibold text-gray-800">
          Corporator Priya Deshmukh
        </div>
      </div>

      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Ward</div>
        <div className="mt-0.5 text-[12px] font-semibold text-gray-800">Ward 12</div>
      </div>

      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
          Resolved Rate
        </div>
        <div className="mt-0.5 text-[20px] font-bold text-gray-900">68.5%</div>
      </div>

      <div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
          Avg Resolution Time
        </div>
        <div className="mt-0.5 text-[16px] font-bold text-gray-900">
          2.8{" "}
          <span className="text-[10px] font-medium text-gray-500">days</span>
        </div>
      </div>
    </div>
  </div>

  {/* Footer section */}
  <div className="border-t p-3">
    <SignOutButton redirectUrl="/">
      <button className="w-full rounded-md border px-2.5 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50">
        Logout
      </button>
    </SignOutButton>
  </div>
</PopoverContent>
</Popover>

            {/* Header Sign Out (kept) */}
            <SignOutButton redirectUrl="/">
              <button
                className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              Mayor-Rakesh Gupta
            </h1>
            <p className="text-xs text-gray-500">Operational console for reported civic issues</p>
          </div>

        <div className="flex items-center gap-2">
            <button
              className="hidden sm:inline-flex items-center rounded-md border px-2.5 py-1.5 text-xs hover:bg-gray-50"
              onClick={onExportCSV}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* KPI Row — Side-by-side cards */}
<div className="mt-5 flex flex-wrap justify-start gap-4 sm:gap-6">
  <div className="flex-1 min-w-[140px] max-w-[200px]">
    <KPICard title="Open Issues" value="5" />
  </div>
  <div className="flex-1 min-w-[140px] max-w-[200px]">
    <KPICard title="Overdue Count" value="3" intent="danger" />
  </div>
</div>


        {/* Main Content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Column */}
          <section className="lg:col-span-3">
            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:w-2/3">
                <label htmlFor="search" className="sr-only">
                  Search issues
                </label>
                <div className="relative">
                  <input
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, locality, or person in charge…"
                    className="w-full rounded-md border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-hidden
                  >
                    ⌕
                  </span>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex shrink-0 gap-2">
                {statusTabs.map((t) => {
                  const active = status === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setStatus(t.key)}
                      className={[
                        "px-3 py-2 text-xs rounded-md border transition",
                        active ? "bg-gray-900 text-white border-gray-900" : "hover:bg-gray-50",
                      ].join(" ")}
                      aria-pressed={active}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Issues Feed */}
            <IssueList /* query={query} status={status} */ />
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            {/* Ward-wise Overdue */}
            <div className="rounded-xl border p-4">
              <div className="text-sm font-semibold mb-3">Ward-wise Overdue</div>
              <ul className="space-y-2">
                {[
                  { ward: "Ward 12", count: 1 },
                  { ward: "Ward 11", count: 1 },
                  { ward: "Ward 8", count: 1 },
                ].map((w) => (
                  <li key={w.ward} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{w.ward}</span>
                    <span className="font-medium text-red-600">{w.count}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <button
                  onClick={onOpenHeatmap}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Open City Heatmap
                </button>
                <button
                  onClick={onExportCSV}
                  className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl border p-4">
              <div className="text-sm font-semibold mb-2">Admin Notes</div>
              <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                <li>
                  Click <span className="font-medium text-gray-700">View</span> on an issue to open
                  the details dialog.
                </li>
                <li>Use filters above to focus by status.</li>
                <li>Realtime updates arrive automatically on new reports.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ——— Small Components ——— */

function KPICard({
  title,
  value,
  intent,
}: {
  title: string;
  value: string;
  intent?: "danger" | "default";
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs font-medium text-gray-500">{title}</div>
      <div
        className={[
          "mt-1 text-2xl font-bold",
          intent === "danger" ? "text-red-600" : "text-gray-900",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
