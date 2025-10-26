"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export function FloatingPostButton({ onClick }: { onClick: () => void }) {
  const { isSignedIn } = useAuth();

  const handleClick = () => {
    if (!isSignedIn) {
      toast.warning(
        <div>
          <p
            style={{
              fontSize: "18px",
              fontWeight: "400",
              color: "#111",
              marginBottom: "4px",
            }}
          >
            Please sign in first
          </p>
          <p
            style={{
              fontSize: "10px",
              fontWeight: "200",
              color: "light-black",
            }}
          >
            Sign in or Sign up to post an issue.
          </p>
        </div>,
        {
          action: {
            label: "Go to sign in",
            onClick: () => {
              window.location.href = "/account";
            },
          },
        }
      );
      return;
    }
    onClick();
  };

  return (
    <div className="fixed bottom-6 right-6">
      <Button
        size="icon"
        className="rounded-full w-14 h-14 bg-black hover:bg-green-600"
        aria-label="Create a new issue"
        title="Create a new issue"
        onClick={handleClick}
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
