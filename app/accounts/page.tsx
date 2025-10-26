// app/account/page.tsx
"use client"

import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, useUser, UserProfile } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Trophy, Star, Crown, Flame, Medal, Target, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type Gamification = {
  level: number
  xp: number
  xpForNext: number
  streakDays: number
  badges: Array<{ id: string; name: string; icon: "trophy"|"medal"|"star"|"target"; earnedAt: string }>
  rank: number
  percentile: number
  recent: Array<{ id: string; title: string; deltaXp: number; at: string }>
}

// Removed unused API_BASE
const FEED_URL = process.env.NEXT_PUBLIC_FEED_URL || "http://localhost:3000"

export default function AccountPage() {
  return (
    <>
      <SignedOut>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to view your progress and rewards.
          </p>
          <div className="mt-6">
            <SignInButton>
              <Button>Sign in</Button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <GamifiedAccount />
      </SignedIn>
    </>
  )
}

function GamifiedAccount() {
  const { user } = useUser()
  const [data, setData] = useState<Gamification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let stop = false
    ;(async () => {
      try {
        // mock API data — replace with real endpoint later
        const mock: Gamification = {
          level: 7,
          xp: 1420,
          xpForNext: 1800,
          streakDays: 5,
          badges: [
            { id: "b1", name: "First Report", icon: "trophy", earnedAt: "2025-10-01" },
            { id: "b2", name: "Helpful Comment", icon: "medal", earnedAt: "2025-10-10" },
            { id: "b3", name: "Community Star", icon: "star", earnedAt: "2025-10-18" },
          ],
          rank: 23,
          percentile: 92,
          recent: [
            { id: "r1", title: "Reported pothole on MG Road", deltaXp: 50, at: "2025-10-23" },
            { id: "r2", title: "Tagged post: 'Garbage'", deltaXp: 10, at: "2025-10-24" },
            { id: "r3", title: "Comment upvoted x4", deltaXp: 20, at: "2025-10-25" },
          ],
        }
        if (!stop) setData(mock)
      } finally {
        if (!stop) setLoading(false)
      }
    })()
    return () => { stop = true }
  }, [])

  const xpPct = data ? Math.min(100, Math.round((data.xp / data.xpForNext) * 100)) : 0

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Account</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {user?.fullName || user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>

        {/* Direct redirect to feed */}
        <Button
          variant="outline"
          onClick={() => {
            window.location.href = FEED_URL
          }}
        >
          Back to Feed
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* Level & XP */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Level Progress</CardTitle>
            <Crown className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold">Level {data.level}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.xp}/{data.xpForNext} XP
                  </div>
                </div>
                <div className="mt-3">
                  <Progress value={xpPct} aria-label="XP progress to next level" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Flame className="h-4 w-4" />
                  <span>
                    Streak: <b>{data.streakDays}</b> days
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Rank */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Community Rank</CardTitle>
            <Trophy className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <div className="h-8 w-full animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="text-3xl font-bold">#{data.rank}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Top {data.percentile}%
                </div>
                <Link href="/leaderboard">
                  <Button variant="secondary" className="mt-3 w-full">
                    View Leaderboard
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {/* Badges */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">Badges</CardTitle>
            <Users className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {data.badges.map(b => (
                  <Badge
                    key={b.id}
                    variant="secondary"
                    className="inline-flex items-center gap-1 px-3 py-1"
                  >
                    {b.icon === "trophy" && <Trophy className="h-3.5 w-3.5" />}
                    {b.icon === "medal" && <Medal className="h-3.5 w-3.5" />}
                    {b.icon === "star" && <Star className="h-3.5 w-3.5" />}
                    {b.icon === "target" && <Target className="h-3.5 w-3.5" />}
                    {b.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading || !data ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-muted" />
              ))
            ) : data.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              data.recent.map(r => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="text-sm line-clamp-1">{r.title}</div>
                  <div className="text-xs text-muted-foreground">+{r.deltaXp} XP</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Management */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold">Profile & Security</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal info, email, and sessions.
        </p>
        <div className="mt-4 rounded-lg border">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  )
}
