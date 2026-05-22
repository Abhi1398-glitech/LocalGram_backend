import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import type { User } from "@/lib/auth";
import type { Post } from "@/lib/posts";
import { formatDistanceToNow } from "date-fns";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  chatPartner: { _id: string; name: string; refContent?: string } | null;
  currentUser: User;
};

type ChatMessage = {
  _id?: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  message: string;
  time: string;
};

export function ChatSheet({ isOpen, onClose, post, chatPartner, currentUser }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  // 1. Calculate receiver details and roomId
  const partnerId = post 
    ? (post.userId || post.name || "anonymous")
    : (chatPartner?._id || "anonymous");
    
  const partnerName = post ? post.name : (chatPartner?.name || "Neighbor");
  const refContent = post ? post.content : chatPartner?.refContent;

  const roomId = (post || chatPartner)
    ? [currentUser._id, partnerId].sort().join("_")
    : "";

  // 2. Load Chat History
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://localgram-backend.onrender.com/api/messages/${roomId}`);
        if (!res.ok) throw new Error("Could not load message history");
        const data = await res.json();
        setMessages(data);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, roomId]);

  // 3. Socket Connection & Listeners
  useEffect(() => {
    if (!isOpen || !roomId) return;

    // Join room
    socket.emit("joinRoom", roomId);
    console.log("Joined socket room:", roomId);

    // Listen for incoming messages
    const handleReceiveMessage = (msg: ChatMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id && msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [isOpen, roomId, socket]);

  // 4. Scroll to Bottom on New Messages
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages, isLoading]);

  // 5. Send Message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !roomId) return;

    const messageData = {
      roomId,
      senderId: currentUser._id,
      receiverId: partnerId,
      message: text,
      time: new Date().toISOString()
    };

    // Emit message to Socket server
    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  if (!post && !chatPartner) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex h-full w-full flex-col p-0 sm:max-w-md rounded-l-3xl border-border bg-card">
        {/* Header */}
        <SheetHeader className="border-b border-border/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-base font-semibold leading-none text-foreground">
                Chat with {partnerName}
              </SheetTitle>
              {refContent && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                  Ref: "{refContent}"
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Messages Body */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <div className="mb-3 rounded-full bg-muted p-3">
                <Send className="h-6 w-6 rotate-45 text-muted-foreground/60" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Send a message to start a conversation!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full px-4 py-4">
              <div className="space-y-4">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === currentUser._id;
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm select-text whitespace-pre-wrap break-all
                        ${isMe 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-muted/80 text-foreground rounded-tl-none border border-border/40'
                        }`}
                      >
                        {msg.message}
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.time), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Form Footer */}
        <form
          onSubmit={handleSend}
          className="border-t border-border/60 bg-card/60 p-4 backdrop-blur flex items-center gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={1000}
            className="flex-1 rounded-full border-border/80 bg-background/50 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" className="h-9 w-9 rounded-full" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
