import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";
import { createPost, type Location } from "@/lib/posts";
import type { User } from "@/lib/auth";

type Props = { 
  location: Location;
  currentUser: User | null;
};

export function CreatePost({ location, currentUser }: Props) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const qc = useQueryClient();

  // Sync logged-in user name automatically
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
    } else {
      setName("");
    }
  }, [currentUser]);

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      setContent("");
      qc.invalidateQueries({ queryKey: ["posts", location.pincode] });
      toast.success("Post shared with your neighborhood");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = currentUser ? currentUser.name : name.trim();
    const c = content.trim();
    if (!n) return toast.error("Please add your name");
    if (!c) return toast.error("Please write something to share");
    mutation.mutate({ 
      ...location, 
      name: n, 
      content: c, 
      userId: currentUser?._id 
    });
  };

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
          Share with your neighborhood
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {currentUser ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {currentUser.name[0]?.toUpperCase()}
              </div>
              <p className="text-sm text-muted-foreground">
                Posting as <span className="font-semibold text-foreground">{currentUser.name}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Your name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya"
                maxLength={60}
                className="rounded-xl border-border/80 focus-visible:ring-primary"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">What do you need or want to share?</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Looking for a plumber near MG Road tomorrow morning…"
              maxLength={500}
              rows={4}
              className="rounded-xl border-border/80 focus-visible:ring-primary resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </p>
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto rounded-xl">
            <Send className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Posting…" : "Post"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
