// components/feed-comp/NewPostDialog.tsx
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useAuth } from "@clerk/nextjs"
import { api } from "@/lib/api"
import { cn as _cn } from "@/lib/utils"

type CreatePayload = {
  title: string
  description: string
  location: string
  image: string
  category?: string
  aiConfidence?: number
  ward?: string | undefined
}

type Step = "compose" | "review"
type Coords = { lat: number; lng: number } | null

export function NewPostDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (payload: CreatePayload) => Promise<void> | void
}) {
  const { getToken, isSignedIn } = useAuth()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [resolvedAddress, setResolvedAddress] = useState("")
  const [coords, setCoords] = useState<Coords>(null)
  const [fetchingLoc, setFetchingLoc] = useState(false)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>("compose")
  const [imageUrl, setImageUrl] = useState<string>("")

  const [aiCategory, setAiCategory] = useState<string | undefined>()
  const [aiConfidence, setAiConfidence] = useState<number | undefined>()

  const dropRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Typed cn fallback (no any)
  const cn = (...cls: (string | false | null | undefined)[]) =>
    (typeof _cn === "function"
      ? _cn
      : ((...k: (string | false | null | undefined)[]) => k.filter(Boolean).join(" "))
    )(...cls)

  // Clean preview URL on unmount/close
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("")
      setDescription("")
      setResolvedAddress("")
      setCoords(null)
      setFile(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setError(null)
      setBusy(false)
      setIsDragging(false)
      setStep("compose")
      setImageUrl("")
      setAiCategory(undefined)
      setAiConfidence(undefined)
      setFetchingLoc(false)
    }
  }, [open])

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }
    const MAX_BYTES = 5 * 1024 * 1024 // 5MB
    if (f.size > MAX_BYTES) {
      setError("Image too large (max 5MB).")
      return
    }
    setError(null)
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }, [previewUrl])

  const onInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  // Drag-and-drop handlers (depend on handleFile)
  useEffect(() => {
    const el = dropRef.current
    if (!el) return

    const onDragOver = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const f = e.dataTransfer?.files?.[0]
      if (f) handleFile(f)
    }

    el.addEventListener("dragover", onDragOver)
    el.addEventListener("dragleave", onDragLeave)
    el.addEventListener("drop", onDrop)
    return () => {
      el.removeEventListener("dragover", onDragOver)
      el.removeEventListener("dragleave", onDragLeave)
      el.removeEventListener("drop", onDrop)
    }
  }, [handleFile])

  // Acquire current location via browser GPS and reverse-geocode
  const fetchCurrentLocation = async () => {
    if (fetchingLoc || busy) return
    setError(null)
    setFetchingLoc(true)

    try {
      // 1) Get GPS coords
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      setCoords({ lat, lng })

      // 2) Reverse-geocode (client-side via OSM Nominatim)
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lng),
        format: "json",
        addressdetails: "1",
      })

      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      })

      if (!res.ok) {
        throw new Error("Reverse geocoding failed.")
      }
      const data = (await res.json()) as {
        address?: Partial<Record<string, string>>
        display_name?: string
      }

      const a = data?.address ?? {}
      const parts: string[] = [
        a.road,
        a.neighbourhood || a.suburb,
        a.city || a.town || a.village,
        a.state_district || a.state,
        a.postcode,
      ].filter((x): x is string => Boolean(x))

      const compact =
        parts.join(", ") || data?.display_name || `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`
      setResolvedAddress(compact)
    } catch (e: unknown) {
      // Geolocation errors typically expose a numeric `code` (1 = permission denied)
      let msg = "Failed to fetch current location."
      const o = e as Record<string, unknown>
      const code = typeof o?.code === "number" ? (o.code as number) : undefined
      if (code === 1) {
        msg = "Location permission denied. Enable location services and retry."
      } else if (typeof o?.message === "string") {
        msg = o.message as string
      } else if (e instanceof Error) {
        msg = e.message
      }
      setError(msg)
      setCoords(null)
      setResolvedAddress("")
    } finally {
      setFetchingLoc(false)
    }
  }

  const canGenerate =
    resolvedAddress.trim().length >= 3 &&
    !!file &&
    !busy &&
    isSignedIn

  const canPublish =
    title.trim().length >= 3 &&
    description.trim().length >= 5 &&
    resolvedAddress.trim().length >= 3 &&
    !!imageUrl &&
    !busy

  const generateWithAI = async () => {
    if (!canGenerate || !file) return
    setBusy(true)
    setError(null)
    try {
      const BASE = process.env.NEXT_PUBLIC_API_BASE || ""
      const token = await getToken()

      // 1) Cloudinary signature
      const signRes = await fetch(`${BASE}/api/cloudinary/sign`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!signRes.ok) throw new Error("Failed to get Cloudinary signature.")
      const { timestamp, folder, signature, apiKey, cloudName } = (await signRes.json()) as {
        timestamp: number
        folder: string
        signature: string
        apiKey: string | number
        cloudName: string
      }

      // 2) Upload image to Cloudinary
      const fd = new FormData()
      fd.append("file", file)
      fd.append("api_key", String(apiKey))
      fd.append("timestamp", String(timestamp))
      fd.append("signature", String(signature))
      fd.append("folder", String(folder))

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      const upRes = await fetch(uploadUrl, { method: "POST", body: fd })
      if (!upRes.ok) {
        const txt = await upRes.text().catch(() => "")
        throw new Error(`Cloudinary upload failed. ${txt}`)
      }
      const uploaded = (await upRes.json()) as { secure_url?: string }
      const url = uploaded?.secure_url
      if (!url) throw new Error("No image URL returned by Cloudinary.")
      setImageUrl(url)

      // 3) AI draft
      const draft = await api.draftFromImage(url, token ?? "", resolvedAddress.trim(), "")

      // 4) Pre-fill form with AI output for review
      setTitle(draft.title || title)
      setDescription(draft.description || description)
      setAiCategory(draft.category)
      setAiConfidence(draft.confidence)

      setStep("review")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "AI drafting failed. You can still publish manually."
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        location: resolvedAddress.trim(),
        image: imageUrl,
        category: aiCategory,
        aiConfidence: aiConfidence,
      })
      onOpenChange(false)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create the issue."
      setError(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "compose" ? "Report an Issue (AI-assisted)" : "Review & Publish"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title (editable; will be filled after AI) */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Deep pothole on MG Road"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={step === "compose"}
            />
          </div>

          {/* Description (editable; will be filled after AI) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe the issue and its impact…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={step === "compose"}
            />
          </div>

          {/* Location acquisition */}
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={fetchCurrentLocation}
                disabled={fetchingLoc || busy}
              >
                {fetchingLoc ? "Fetching location…" : "Use current location"}
              </Button>
              {coords && (
                <span className="text-xs text-muted-foreground">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </span>
              )}
            </div>
            <Input
              value={resolvedAddress}
              readOnly
              placeholder="No address detected yet"
              className="opacity-90"
            />
            {resolvedAddress && coords && (
              <a
                href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline text-muted-foreground"
              >
                Preview on map
              </a>
            )}
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            {!error && !resolvedAddress && (
              <p className="text-xs text-muted-foreground">
                Grant location permission to auto-fill the address. Ward is inferred by the backend if needed.
              </p>
            )}
          </div>

          {/* Image uploader */}
          <div className="space-y-2">
            <Label>Image</Label>
            <div
              ref={dropRef}
              className={cn(
                "rounded-xl border border-dashed p-4 text-sm",
                "flex items-center justify-between gap-4",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30"
              )}
            >
              <div className="flex-1">
                <p className="font-medium">Drag & drop an image here</p>
                <p className="text-muted-foreground">or choose a file (PNG/JPG, max 5MB)</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={onInputFile}
                  disabled={busy || step === "review"}
                />
              </div>

              {/* Preview */}
              <div className="shrink-0">
                {(previewUrl || imageUrl) ? (
                  <div className="relative w-28 h-24 overflow-hidden rounded-md border">
                    <Image
                      src={previewUrl || imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-24 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </div>
            {aiCategory && (
              <p className="text-xs text-muted-foreground">
                AI category: <span className="font-medium">{aiCategory}</span>
                {typeof aiConfidence === "number" ? ` • confidence ${(aiConfidence * 100).toFixed(0)}%` : ""}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>

          {step === "compose" ? (
            <Button onClick={generateWithAI} disabled={!canGenerate}>
              {busy ? "Analyzing…" : "Generate with AI"}
            </Button>
          ) : (
            <Button onClick={publish} disabled={!canPublish}>
              {busy ? "Publishing…" : "Publish"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
