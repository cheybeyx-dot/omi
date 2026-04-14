"use client";
// components/SupportChat.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  MessageSquare,
  X,
  Send,
  Paperclip,
  Image as ImageIcon,
  ChevronDown,
  Loader2,
  Check,
  CheckCheck,
  Headphones,
} from "lucide-react";

type Message = {
  id: string;
  message: string;
  is_admin: boolean;
  sender_id: string | null;
  image_url?: string | null;
  image_name?: string | null;
  seen: boolean;
  created_at: string;
};

type Ticket = {
  id: string;
  status: string;
  subject: string;
  created_at: string;
};

const QUICK_TOPICS = [
  "Payment not confirmed",
  "Withdrawal issue",
  "KYC verification",
  "GPU plan question",
  "Account access problem",
  "Other",
];

const GUEST_TICKET_KEY = "omnitask_support_ticket_id";

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"start" | "form" | "chat">("start");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load messages by ticket id ────────────────────────────────
  const loadMessages = useCallback(async (ticketId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (!error) {
      setMessages(data || []);
    }
    setLoading(false);
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      150,
    );
  }, []);

  // ── Init: load user session + recover existing ticket ─────────
  useEffect(() => {
    async function init() {
      // Get auth user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let uid: string | null = null;

      if (user) {
        uid = user.id;
        setUserId(uid);
        setUserEmail(user.email || "");
        setFormEmail(user.email || "");

        // Load full name
        const { data: profile } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", uid)
          .maybeSingle();
        if (profile?.full_name) {
          setUserName(profile.full_name);
          setFormName(profile.full_name);
        }

        // Check for open ticket for logged-in user
        const { data: existingTicket } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", uid)
          .in("status", ["open", "in_progress"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingTicket) {
          setTicket(existingTicket);
          setStage("chat");
          await loadMessages(existingTicket.id);
          setInitialized(true);
          return;
        }
      }

      // For guests: recover ticket from localStorage
      try {
        const savedId = localStorage.getItem(GUEST_TICKET_KEY);
        if (savedId) {
          const { data: savedTicket } = await supabase
            .from("support_tickets")
            .select("*")
            .eq("id", savedId)
            .maybeSingle();

          if (
            savedTicket &&
            ["open", "in_progress"].includes(savedTicket.status)
          ) {
            setTicket(savedTicket);
            setStage("chat");
            await loadMessages(savedTicket.id);
            setInitialized(true);
            return;
          } else {
            localStorage.removeItem(GUEST_TICKET_KEY);
          }
        }
      } catch {
        // localStorage not available
      }

      setInitialized(true);
    }

    init();
  }, [loadMessages]);

  // ── Real-time subscription ────────────────────────────────────
  useEffect(() => {
    if (!ticket) return;

    const ch = supabase
      .channel(`support_messages_${ticket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${ticket.id}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          if (msg.is_admin && !open) setUnreadCount((c) => c + 1);
          setTimeout(
            () =>
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            100,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [ticket, open]);

  // ── Reset unread when opened ──────────────────────────────────
  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  // ── Image handling ────────────────────────────────────────────
  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImage(
    file: File,
  ): Promise<{ url: string; name: string } | null> {
    try {
      const ext = file.name.split(".").pop();
      const path = `support/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("support-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) return null;
      const { data: urlData } = supabase.storage
        .from("support-images")
        .getPublicUrl(path);
      return { url: urlData.publicUrl, name: file.name };
    } catch {
      return null;
    }
  }

  // ── Create ticket ─────────���───────────────────────────────────
  async function handleStartChat() {
    if (!formTopic) {
      alert("Please select a topic");
      return;
    }
    if (!formMessage.trim()) {
      alert("Please describe your issue");
      return;
    }

    const name = formName.trim() || userName || "User";
    const email = formEmail.trim() || userEmail;

    setLoading(true);

    const { data: newTicket, error: ticketErr } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId || null,
        guest_name: name,
        guest_email: email,
        subject: formTopic,
        status: "open",
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (ticketErr || !newTicket) {
      alert("Failed to create ticket. Please try again.");
      setLoading(false);
      return;
    }

    // Save for guest session persistence
    try {
      localStorage.setItem(GUEST_TICKET_KEY, newTicket.id);
    } catch {
      /* ignore */
    }

    // Handle image
    let imgUrl: string | null = null;
    let imgName: string | null = null;
    if (imageFile) {
      setUploading(true);
      const result = await uploadImage(imageFile);
      if (result) {
        imgUrl = result.url;
        imgName = result.name;
      }
      setUploading(false);
    }

    // Insert first message
    await supabase.from("support_messages").insert({
      ticket_id: newTicket.id,
      sender_id: userId || null,
      is_admin: false,
      message: `[${formTopic}]\n${formMessage.trim()}`,
      image_url: imgUrl,
      image_name: imgName,
      seen: false,
    });

    // Auto-reply
    setTimeout(async () => {
      await supabase.from("support_messages").insert({
        ticket_id: newTicket.id,
        sender_id: null,
        is_admin: true,
        message: `Hi ${name}! 👋 Thanks for reaching out about "${formTopic}". Our support team will respond within 2 hours (09:00–18:00 UTC). Your ticket ID is #${newTicket.id.slice(0, 8).toUpperCase()}.`,
        seen: false,
      });
    }, 1500);

    setTicket(newTicket);
    setStage("chat");
    removeImage();
    setLoading(false);

    // Load messages after state is set
    await loadMessages(newTicket.id);
  }

  // ── Send message ──────────────────────────────────────────────
  async function sendMessage() {
    if (!ticket) return;
    if (!text.trim() && !imageFile) return;
    setSending(true);

    let imgUrl: string | null = null;
    let imgName: string | null = null;
    if (imageFile) {
      setUploading(true);
      const result = await uploadImage(imageFile);
      if (result) {
        imgUrl = result.url;
        imgName = result.name;
      }
      setUploading(false);
    }

    const msgText =
      text.trim() ||
      (imgName ? `Sent an image: ${imgName}` : "📎 Image attached");

    const { data: newMessage, error } = await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId || null,
      is_admin: false,
      message: msgText,
      image_url: imgUrl,
      image_name: imgName,
      seen: false,
    }).select();

    if (!error && newMessage && newMessage.length > 0) {
      // Immediately add message to state so user sees it
      setMessages((prev) => [...prev, newMessage[0]]);
      
      // Update ticket
      await supabase
        .from("support_tickets")
        .update({ last_message_at: new Date().toISOString(), status: "open" })
        .eq("id", ticket.id);

      setText("");
      removeImage();
      
      // Scroll to bottom
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } else {
      alert("Failed to send message. Please try again.");
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── UI ────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-auto" style={{ pointerEvents: 'auto' }}>
        {!open && (
          <div className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
            Need help? 💬
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 cursor-pointer bg-gradient-to-br from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
          style={
            open
              ? {
                  background: "#1e293b",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  pointerEvents: 'auto',
                }
              : {
                  pointerEvents: 'auto',
                }
          }
        >
          {open ? (
            <X size={22} className="text-white" />
          ) : (
            <Headphones size={22} className="text-white" />
          )}
          {unreadCount > 0 && !open && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[9px] font-black">
                {unreadCount}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-5 z-40 flex flex-col rounded-2xl shadow-2xl overflow-hidden w-full sm:w-auto"
          style={{
            width: "min(380px, calc(100vw - 32px))",
            height: "min(560px, calc(100vh - 100px))",
            background: "#0d1117",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 shrink-0"
            style={{
              background: "linear-gradient(135deg, #059669, #047857)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                <Headphones size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm">
                  OmniTask Support
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <p className="text-emerald-200 text-[10px]">
                    Online · Replies in ~2 hours
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* ── STAGE: start ── */}
            {stage === "start" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="text-center pt-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare size={24} className="text-emerald-400" />
                  </div>
                  <p className="text-white font-black text-base">
                    How can we help?
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Start a conversation with our support team
                  </p>
                </div>
                <div className="space-y-2">
                  {QUICK_TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setFormTopic(t);
                        setStage("form");
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm text-slate-300 hover:text-white transition-all flex items-center justify-between gap-2"
                      style={{
                        background: "rgba(30,41,59,0.6)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {t}
                      <ChevronDown
                        size={12}
                        className="text-slate-500 -rotate-90 shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STAGE: form ── */}
            {stage === "form" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <button
                  onClick={() => setStage("start")}
                  className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1"
                >
                  ← Back
                </button>
                <div
                  className="rounded-xl px-3 py-2"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.15)",
                  }}
                >
                  <p className="text-emerald-400 text-xs font-bold">
                    {formTopic}
                  </p>
                </div>

                {!userId && (
                  <>
                    <div>
                      <label className="text-slate-400 text-xs font-bold mb-1.5 block">
                        Your Name
                      </label>
                      <input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-bold mb-1.5 block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-slate-400 text-xs font-bold mb-1.5 block">
                    Describe your issue
                  </label>
                  <textarea
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Please describe what's happening in detail..."
                    rows={4}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-bold mb-1.5 block flex items-center gap-1">
                    <ImageIcon size={10} /> Attach Screenshot (optional)
                  </label>
                  {imagePreview ? (
                    <div
                      className="relative rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-32 object-cover"
                      />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-300 flex items-center justify-center gap-2 border-dashed"
                      style={{
                        background: "rgba(30,41,59,0.4)",
                        border: "1px dashed rgba(255,255,255,0.1)",
                      }}
                    >
                      <Paperclip size={12} /> Click to attach image or
                      screenshot
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                <button
                  onClick={handleStartChat}
                  disabled={loading || !formMessage.trim()}
                  className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #059669, #10b981)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Starting
                      chat...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Start Chat
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── STAGE: chat ── */}
            {stage === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {loading ? (
                    <div className="flex justify-center pt-8">
                      <Loader2
                        size={20}
                        className="text-emerald-400 animate-spin"
                      />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center pt-6 text-slate-500 text-sm">
                      No messages yet
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                      >
                        {msg.is_admin && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mr-2 mt-1">
                            <Headphones
                              size={10}
                              className="text-emerald-400"
                            />
                          </div>
                        )}
                        <div className="max-w-[80%] space-y-1">
                          <div
                            className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.is_admin ? "rounded-tl-sm" : "rounded-tr-sm"}`}
                            style={
                              msg.is_admin
                                ? {
                                    background: "rgba(30,41,59,0.9)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    color: "#e2e8f0",
                                  }
                                : {
                                    background:
                                      "linear-gradient(135deg, #059669, #047857)",
                                    color: "white",
                                  }
                            }
                          >
                            {msg.message}
                          </div>
                          {msg.image_url && (
                            <a
                              href={msg.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-xl overflow-hidden"
                              style={{
                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              <img
                                src={msg.image_url}
                                alt={msg.image_name || "Attachment"}
                                className="max-h-48 w-full object-cover"
                              />
                            </a>
                          )}
                          <div
                            className={`flex items-center gap-1 text-[10px] text-slate-600 ${msg.is_admin ? "justify-start" : "justify-end"}`}
                          >
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString(
                                "en",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                            {!msg.is_admin &&
                              (msg.seen ? (
                                <CheckCheck
                                  size={10}
                                  className="text-emerald-400"
                                />
                              ) : (
                                <Check size={10} />
                              ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {imagePreview && (
                  <div className="px-3 py-2 border-t border-slate-800/50 flex items-center gap-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">
                        {imageFile?.name}
                      </p>
                    </div>
                    <button
                      onClick={removeImage}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="px-3 pb-3 pt-2 border-t border-slate-800/50 shrink-0">
                  {ticket?.status === "resolved" ||
                  ticket?.status === "closed" ? (
                    <div className="text-center py-2">
                      <p className="text-slate-500 text-xs">
                        This ticket is {ticket.status}.
                      </p>
                      <button
                        onClick={() => {
                          setTicket(null);
                          setStage("start");
                          setMessages([]);
                          try {
                            localStorage.removeItem(GUEST_TICKET_KEY);
                          } catch {
                            /* ignore */
                          }
                        }}
                        className="text-emerald-400 text-xs hover:underline mt-1"
                      >
                        Open new ticket
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-400 hover:bg-slate-800/60 shrink-0"
                      >
                        {uploading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Paperclip size={16} />
                        )}
                      </button>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                        style={{ maxHeight: "80px" }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || (!text.trim() && !imageFile)}
                        className="p-2.5 rounded-xl disabled:opacity-40 shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #059669, #10b981)",
                        }}
                      >
                        {sending ? (
                          <Loader2
                            size={15}
                            className="text-white animate-spin"
                          />
                        ) : (
                          <Send size={15} className="text-white" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
