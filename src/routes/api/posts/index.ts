import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const postSchema = z.object({
  name: z.string().trim().min(1).max(60),
  content: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(60),
  area: z.string().trim().min(1).max(60),
  pincode: z.string().trim().regex(/^\d{4,10}$/),
  userId: z.string().optional(),
});

export const Route = createFileRoute("/api/posts/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        
        const parsed = postSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(parsed.error.issues[0]?.message ?? "Invalid input", {
            status: 400,
          });
        }

        try {
          // Proxy to our Mongoose Express backend
          const res = await fetch("https://localgram-backend.onrender.com/api/posts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(parsed.data),
          });

          if (!res.ok) {
            const errText = await res.text();
            return new Response(errText || "Backend creation failed", { status: res.status });
          }

          const createdPost = await res.json();
          
          // Normalize Mongoose Post to match the frontend expectations, INCLUDING userId!
          const normalizedPost = {
            id: createdPost._id,
            name: createdPost.name,
            content: createdPost.content,
            city: createdPost.city,
            area: createdPost.area,
            pincode: createdPost.pincode,
            created_at: createdPost.createdAt || createdPost.created_at,
            userId: createdPost.userId || createdPost.user_id,
          };

          return Response.json({ post: normalizedPost });
        } catch (error) {
          console.error("Backend Proxy Insert post failed:", error);
          return new Response("Failed to connect to backend", { status: 500 });
        }
      },
    },
  },
});
