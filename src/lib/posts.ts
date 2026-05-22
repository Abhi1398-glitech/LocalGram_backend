export type Post = {
  id: string;
  name: string;
  content: string;
  city: string;
  area: string;
  pincode: string;
  created_at: string;
  userId?: string;
};

export type Location = {
  city: string;
  area: string;
  pincode: string;
};

export type CreatePostInput = Location & {
  name: string;
  content: string;
  userId?: string;
};

export async function fetchPosts(pincode: string): Promise<Post[]> {
  const res = await fetch(`/api/posts/${encodeURIComponent(pincode)}`);
  if (!res.ok) throw new Error("Failed to load posts");
  const json = (await res.json()) as { posts: Post[] };
  return json.posts;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const res = await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create post");
  }
  const json = (await res.json()) as { post: Post };
  return json.post;
}
export async function updatePost(id: string, content: string, userId: string): Promise<Post> {
  const res = await fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, userId }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update post");
  }
  const json = (await res.json()) as { post: Post };
  return json.post;
}

export async function deletePost(id: string, userId: string): Promise<void> {
  const res = await fetch(`/api/posts/${id}?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete post");
  }
}
