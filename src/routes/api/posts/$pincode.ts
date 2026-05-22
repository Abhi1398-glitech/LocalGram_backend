import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/posts/$pincode")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const pincode = params.pincode;
        if (!/^\d{4,10}$/.test(pincode)) {
          return new Response("Invalid pincode", { status: 400 });
        }

        try {
          // Proxy to our Mongoose Express backend
          const res = await fetch(`https://localgram-backend.onrender.com/api/posts/${encodeURIComponent(pincode)}`);
          if (!res.ok) {
            return new Response("Failed to fetch posts from backend", { status: res.status });
          }

          const postsList = await res.json(); // returns Post array from Express backend

          // Normalize MongoDB Post schema keys to frontend expectations, INCLUDING userId!
          const normalizedPosts = postsList.map((p: any) => ({
            id: p._id,
            name: p.name,
            content: p.content,
            city: p.city,
            area: p.area,
            pincode: p.pincode,
            created_at: p.createdAt || p.created_at,
            userId: p.userId || p.user_id,
          }));

          return Response.json({ posts: normalizedPosts ?? [] });
        } catch (error) {
          console.error("Backend Proxy Fetch posts failed:", error);
          return new Response("Failed to load posts from backend", { status: 500 });
        }
      },
      PUT: async ({ request, params }) => {
        // we use pincode param as the id for PUT requests
        const id = params.pincode;
        try {
          const body = await request.json();
          const res = await fetch(`https://localgram-backend.onrender.com/api/posts/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errText = await res.text();
            return new Response(errText || "Backend update failed", { status: res.status });
          }

          const updatedPost = await res.json();
          const normalizedPost = {
            id: updatedPost._id,
            name: updatedPost.name,
            content: updatedPost.content,
            city: updatedPost.city,
            area: updatedPost.area,
            pincode: updatedPost.pincode,
            created_at: updatedPost.createdAt || updatedPost.created_at,
            userId: updatedPost.userId || updatedPost.user_id,
          };
          return Response.json({ post: normalizedPost });
        } catch (error) {
          console.error("Backend Proxy Update post failed:", error);
          return new Response("Failed to connect to backend", { status: 500 });
        }
      },
      DELETE: async ({ request, params }) => {
        // we use pincode param as the id for DELETE requests
        const id = params.pincode;
        try {
          const url = new URL(request.url);
          const userId = url.searchParams.get("userId");
          
          const res = await fetch(`https://localgram-backend.onrender.com/api/posts/${id}?userId=${userId}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            const errText = await res.text();
            return new Response(errText || "Backend deletion failed", { status: res.status });
          }

          return Response.json({ success: true });
        } catch (error) {
          console.error("Backend Proxy Delete post failed:", error);
          return new Response("Failed to connect to backend", { status: 500 });
        }
      },
    },
  },
});
