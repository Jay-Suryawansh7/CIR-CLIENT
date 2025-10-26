// components/feed-comp/FeedList.tsx
"use client"

export interface Issue {
  id: string            // ✅ string, not number
  title: string
  description: string
  location: string
  ward?: string
  image: string
  likes: number
  comments: number
  createdAt?: string
}



