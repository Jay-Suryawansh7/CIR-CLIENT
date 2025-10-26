// components/feed-comp/Navbar.tsx
"use client";

import Link from "next/link";
import { FileWarning, LogOut } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  SignOutButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2" aria-label="CIR Home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted">
              <FileWarning className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="font-semibold tracking-tight">CIR</span>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Civic Issue Reporter
            </span>
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="h-9">Sign in</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="h-9">Sign up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            {/* Sign out icon */}
            <SignOutButton redirectUrl="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </SignOutButton>

            {/* Account button */}
            <Link href="/accounts">
              <Button className="h-9">Account</Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
