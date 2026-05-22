import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Pencil, LogOut, User as UserIcon, MessageSquareHeart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationForm } from "@/components/LocationForm";
import { CreatePost } from "@/components/CreatePost";
import { PostsFeed } from "@/components/PostsFeed";
import { AuthModal } from "@/components/AuthModal";
import { ChatSheet } from "@/components/ChatSheet";
import { InboxSheet } from "@/components/InboxSheet";
import type { Location, Post } from "@/lib/posts";
import { getCurrentUser, clearAuth, type User } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Home,
});

const STORAGE_KEY = "localgram.location";

function Home() {
  const [location, setLocation] = useState<Location | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatPost, setActiveChatPost] = useState<Post | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<{ _id: string; name: string } | null>(null);

  // Sync location and user authentication on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLocation(JSON.parse(raw) as Location);
    } catch {
      // ignore
    }

    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    setHydrated(true);
  }, []);

  const handleSetLocation = (loc: Location) => {
    setLocation(loc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {
      // ignore
    }
  };

  const handleChange = () => setLocation(null);

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    toast.info("Logged out successfully");
  };

  const handleOpenChat = (post: Post) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setActiveChatPartner(null);
    setActiveChatPost(post);
    setIsChatOpen(true);
  };

  const handleSelectChatFromInbox = (partner: { _id: string; name: string }) => {
    setIsInboxOpen(false);
    setActiveChatPost(null);
    setActiveChatPartner(partner);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20">
              L
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight leading-none text-foreground flex items-center gap-1">
                LocalGram 
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-1">Your neighborhood board</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {location && (
              <button
                onClick={handleChange}
                className="flex items-center gap-1 rounded-full border border-border bg-background/50 px-2.5 py-1 text-xs text-muted-foreground transition-all duration-300 hover:text-foreground hover:border-border/80"
              >
                <MapPin className="h-3 w-3 text-primary animate-pulse" />
                <span className="hidden sm:inline">
                  {location.area}, {location.pincode}
                </span>
                <span className="sm:hidden">{location.pincode}</span>
                <Pencil className="h-2.5 w-2.5 ml-0.5" />
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2 ml-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInboxOpen(true)}
                  className="rounded-full text-xs font-semibold px-3 h-8 border-primary/25 bg-primary/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 flex items-center"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                  Chats
                </Button>

                <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/80 bg-background/30 px-2.5 py-1 text-xs text-foreground font-medium">
                  <UserIcon className="h-3 w-3 text-primary" />
                  <span>{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-all duration-300 hover:text-destructive hover:bg-destructive/5"
                  title="Log Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
                className="rounded-full text-xs font-semibold px-3 h-8 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 ml-1"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {!hydrated ? null : !location ? (
          <div className="mt-6 animate-fade-in">
            <LocationForm onSubmit={handleSetLocation} />
          </div>
        ) : (
          <div className="space-y-6">
            <CreatePost location={location} currentUser={currentUser} />
            <div>
              <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
                <MessageSquareHeart className="h-3.5 w-3.5 text-primary" />
                Posts in {location.area} ({location.pincode})
              </h2>
              <PostsFeed 
                location={location} 
                currentUser={currentUser} 
                onOpenChat={handleOpenChat} 
                onOpenAuth={() => setIsAuthOpen(true)} 
              />
            </div>
          </div>
        )}
      </main>

      {/* Popups & Drawers */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={(user) => setCurrentUser(user)} 
      />

      {currentUser && (
        <InboxSheet
          isOpen={isInboxOpen}
          onClose={() => setIsInboxOpen(false)}
          currentUser={currentUser}
          onSelectChat={handleSelectChatFromInbox}
        />
      )}

      {currentUser && (
        <ChatSheet 
          isOpen={isChatOpen} 
          onClose={() => {
            setIsChatOpen(false);
            setActiveChatPost(null);
            setActiveChatPartner(null);
          }} 
          post={activeChatPost} 
          chatPartner={activeChatPartner}
          currentUser={currentUser} 
        />
      )}
    </div>
  );
}
