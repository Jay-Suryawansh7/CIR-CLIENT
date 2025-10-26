// lib/api.ts
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const BASE = RAW_BASE.replace(/\/$/, ""); // normalize to no trailing slash

type HttpInit = RequestInit & { json?: unknown };

function ensurePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

async function http<T>(
  path: string,
  init: HttpInit = {},
  token?: string
): Promise<T> {
  const url = `${BASE}${ensurePath(path)}`;

  const headers = new Headers(init.headers || {});
  // Only set JSON header if we are sending a body
  if (init.json !== undefined || init.body !== undefined) {
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const body = init.json !== undefined ? JSON.stringify(init.json) : init.body;

  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), 30_000);

  try {
    const res = await fetch(url, {
      ...init,
      body,
      headers,
      cache: "no-store",
      signal: ac.signal,
    });

    if (!res.ok) {
      let msg = "";
      try {
        msg = await res.text();
      } catch {}
      throw new Error(msg || `Request failed: ${res.status}`);
    }

    // Some endpoints may be 204
    const text = await res.text();
    return text ? JSON.parse(text) : ({} as T);
  } finally {
    clearTimeout(timeout);
  }
}

export type IssueDTO = {
  id: string;
  title: string;
  description: string;
  location: string;
  ward?: string;
  image: string;
  likes: number;
  comments: number;
  createdAt?: string;
  userId?: string;
  userHasLiked?: boolean;
  status?: string; // <-- add this line here
  assignedTo?: string;
  category?: string;
  aiConfidence?: number;
  aiSummary?: string;
};

export type DraftResponse = {
  title: string;
  description: string;
  category: string;
  confidence: number;
  aiSummary?: string;
};

export const api = {
  // Issues
  listIssues: () => http<IssueDTO[]>("/api/issues"),
  createIssue: (
    payload: Omit<
      IssueDTO,
      "id" | "likes" | "comments" | "createdAt" | "userHasLiked"
    >,
    token?: string
  ) => http<IssueDTO>("/api/issues", { method: "POST", json: payload }, token),

  // Likes (idempotent)
  likeIssue: (id: string, token?: string) =>
    http<{ likes: number; userHasLiked: boolean }>(
      `/api/issues/${id}/like`,
      { method: "POST" },
      token
    ),

  // Delete
  deleteIssue: (id: string, token?: string) =>
    http<{ ok: true }>(`/api/issues/${id}`, { method: "DELETE" }, token),

  // Comments
  listComments: (id: string) =>
    http<
      Array<{ _id: string; text: string; userId?: string; createdAt: string }>
    >(`/api/issues/${id}/comments`),
  addComment: (id: string, text: string, token?: string) =>
    http(
      `/api/issues/${id}/comments`,
      { method: "POST", json: { text } },
      token
    ),

  // Cloudinary signature (protected)
  signUpload: (token?: string) =>
    http<{
      timestamp: number;
      folder: string;
      signature: string;
      apiKey: string;
      cloudName: string;
    }>("/api/cloudinary/sign", { method: "POST" }, token),

  // AI Draft (OpenRouter via backend) — protected
  draftFromImage: (
    imageUrl: string,
    token: string,
    location?: string,
    ward?: string
  ) =>
    http<DraftResponse>(
      "/api/ai/draft",
      { method: "POST", json: { imageUrl, location, ward } },
      token
    ),
};
