import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, RefreshCw, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { User } from "@/lib/auth";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectChat: (partner: { _id: string; name: string }) => void;
};

type ActiveChat = {
  roomId: string;
  lastMessage: string;
  time: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
  };
};

export function InboxSheet({ isOpen, onClose, currentUser, onSelectChat }: Props) {
  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInbox = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://localgram-backend.onrender.com/api/messages/rooms/${currentUser._id}`);
      if (!res.ok) throw new Error("Could not load conversations");
      const data = await res.json();
      setChats(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load inbox conversations");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch when opened
  useEffect(() => {
    if (isOpen) {
      fetchInbox();
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex h-full w-full flex-col p-0 sm:max-w-md rounded-l-3xl border-border bg-card">
        {/* Header */}
        <SheetHeader className="border-b border-border/60 p-4 flex flex-row items-center justify-between">
          <div className="text-left">
            <SheetTitle className="text-base font-semibold leading-none text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-primary" />
              Neighborhood Inbox
            </SheetTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              All your conversations in one place
            </p>
          </div>
          <button
            onClick={fetchInbox}
            disabled={isLoading}
            className="rounded-full p-2 border border-border/60 bg-background/50 hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh Chats"
          >
            {isLoading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
            ) : (
              <RefreshCw className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </SheetHeader>

        {/* List of Chats */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading && chats.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <div className="mb-3 rounded-full bg-muted p-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium">Your inbox is empty</p>
              <p className="text-xs text-muted-foreground mt-1 px-4">
                When you click "Chat" on neighborhood posts or someone messages you, they will appear here!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="divide-y divide-border/30">
                {chats.map((chat) => (
                  <button
                    key={chat.roomId}
                    onClick={() => onSelectChat({ _id: chat.otherUser._id, name: chat.otherUser.name })}
                    className="w-full flex items-start gap-3 p-4 text-left transition-colors duration-200 hover:bg-muted/40 focus:bg-muted/60"
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserIcon className="h-5 w-5" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {chat.otherUser.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(chat.time), { addSuffix: false })} ago
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1 leading-snug">
                        {chat.lastMessage}
                      </p>
                    </div>

                    <div className="self-center pl-1 text-muted-foreground/45 hover:text-primary transition-colors">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
