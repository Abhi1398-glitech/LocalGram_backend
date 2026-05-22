import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, MessageCircle, Inbox, Edit, Trash2 } from "lucide-react";
import { fetchPosts, updatePost, deletePost, type Location, type Post } from "@/lib/posts";
import type { User } from "@/lib/auth";
import { toast } from "sonner";

type Props = {
  location: Location;
  currentUser: User | null;
  onOpenChat: (post: Post) => void;
  onOpenAuth: () => void;
};

export function PostsFeed({ location, currentUser, onOpenChat, onOpenAuth }: Props) {
  const qc = useQueryClient();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: posts, isLoading, isError, refetch } = useQuery({
    queryKey: ["posts", location.pincode],
    queryFn: () => fetchPosts(location.pincode),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; content: string; userId: string }) => 
      updatePost(data.id, data.content, data.userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", location.pincode] });
      setEditingPostId(null);
      toast.success("Post updated!");
    },
    onError: () => toast.error("Failed to update post"),
  });

  const deleteMutation = useMutation({
    mutationFn: (data: { id: string; userId: string }) => 
      deletePost(data.id, data.userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts", location.pincode] });
      toast.success("Post deleted!");
    },
    onError: () => toast.error("Failed to delete post"),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border/60 bg-muted/40 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-2xl border-border/60">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Couldn't load posts.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border/60 bg-muted/20">
        <CardContent className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-medium">No posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to share something in {location.area}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <Card key={p.id} className="rounded-2xl border-border/60 shadow-sm transition-all duration-300 hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            {editingPostId === p.id ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-sm leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingPostId(null)}>Cancel</Button>
                  <Button 
                    size="sm" 
                    onClick={() => updateMutation.mutate({ id: p.id, content: editContent, userId: currentUser!._id })}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground select-text">
                {p.content}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/30 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>
                  {p.city} · {p.area} · {p.pincode}
                </span>
              </div>
              
              {currentUser && p.userId === currentUser._id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    Your Post
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setEditingPostId(p.id);
                      setEditContent(p.content);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this post?")) {
                        deleteMutation.mutate({ id: p.id, userId: currentUser._id });
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  onClick={() => {
                    if (!currentUser) {
                      toast.info("Please register or login to chat with neighbors!");
                      onOpenAuth();
                    } else {
                      onOpenChat(p);
                    }
                  }}
                >
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                  Chat
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
