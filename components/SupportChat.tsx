"use client";
// components/SupportChat.tsx
// Floating support chat widget — works on every page including homepage
// Features: live chat, image/screenshot upload, real-time messages

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
  HelpCircle,
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

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"start" | "form" | "chat">("start");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  // User info
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // Ticket & messages
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  // Form fields (for guests / new ticket)
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTopic, setFormTopic] = useState("");
  const [formMessage, setFormMessage] = useState("");

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load user session ─────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || "");
        setFormEmail(user.email || "");
      }
    });
    supabase
      .from("users")
      .select("full_name")
      .eq("id", (supabase as any)._userId || "")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setFormName(data.full_name);
      });
  }, []);

  // ── Check for existing open ticket ───────────────────────────
  const checkExistingTicket = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setTicket(data);
      setStage("chat");
      loadMessages(data.id);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && open) checkExistingTicket();
  }, [userId, open, checkExistingTicket]);

  // ── Load messages ─────────────────────────────────────────────
  const loadMessages = useCallback(async (ticketId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
    setLoading(false);
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  }, []);

  // ── Real-time subscription ────────────────────────────────────
  useEffect(() => {
    if (!ticket) return;
    const ch = supabase
      .channel(`support_${ticket.id}`)
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
          setMessages((prev) => [...prev, msg]);
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

  // ── Handle image selection ────────────────────────────────────
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

  // ── Upload image to Supabase Storage ─────────────────────────
  async function uploadImage(
    file: File,
  ): Promise<{ url: string; name: string } | null> {
    try {
      const ext = file.name.split(".").pop();
      const path = `support/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("support-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        // Fallback: convert to base64 and store inline if storage not set up
        return null;
      }
      const { data: urlData } = supabase.storage
        .from("support-images")
        .getPublicUrl(path);
      return { url: urlData.publicUrl, name: file.name };
    } catch {
      return null;
    }
  }

  // ── Create new ticket & first message ────────────────────────
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

    // Create ticket
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

    // Auto-reply from support
    setTimeout(async () => {
      await supabase.from("support_messages").insert({
        ticket_id: newTicket.id,
        sender_id: null,
        is_admin: true,
        message: `Hi ${name}! 👋 Thanks for reaching out. We've received your message about "${formTopic}". Our support team will respond within 2 hours (09:00–18:00 UTC). Your ticket ID is #${newTicket.id.slice(0, 8).toUpperCase()}.`,
        seen: false,
      });
    }, 1500);

    setTicket(newTicket);
    setStage("chat");
    removeImage();
    loadMessages(newTicket.id);
    setLoading(false);
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

    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId || null,
      is_admin: false,
      message: msgText,
      image_url: imgUrl,
      image_name: imgName,
      seen: false,
    });

    await supabase
      .from("support_tickets")
      .update({
        last_message_at: new Date().toISOString(),
        status: "open",
      })
      .eq("id", ticket.id);

    setText("");
    removeImage();
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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {/* Tooltip */}
        {!open && (
          <div className="bg-slate-800 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
            Need help? 💬
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95"
          style={{
            background: open
              ? "#1e293b"
              : "linear-gradient(135deg, #059669, #10b981)",
            boxShadow: "0 8px 25px rgba(16,185,129,0.4)",
          }}
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
          className="fixed bottom-24 right-4 sm:right-5 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all"
          style={{
            width: "min(380px, calc(100vw - 32px))",
            height: "min(560px, calc(100vh - 120px))",
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
              className="text-white/70 hover:text-white p-1 transition-colors"
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
                      {t}{" "}
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
                  className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1 transition-colors"
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
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
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
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
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
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>

                {/* Image upload */}
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
                      <p className="text-slate-500 text-[10px] px-2 py-1">
                        {imageFile?.name}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-300 transition-all flex items-center justify-center gap-2 border-dashed"
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
                  className="w-full py-3 rounded-xl font-black text-sm text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
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
                          {/* Image attachment */}
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
                              {msg.image_name && (
                                <p className="text-slate-500 text-[10px] px-2 py-1 bg-slate-900/80">
                                  {msg.image_name}
                                </p>
                              )}
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

                {/* Image preview in chat */}
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
                      <p className="text-slate-500 text-[10px]">
                        {imageFile
                          ? (imageFile.size / 1024).toFixed(0) + " KB"
                          : ""}
                      </p>
                    </div>
                    <button
                      onClick={removeImage}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Message input */}
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
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-400 hover:bg-slate-800/60 transition-all shrink-0"
                        title="Attach image"
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
                        className="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
                        style={{ maxHeight: "80px" }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sending || (!text.trim() && !imageFile)}
                        className="p-2.5 rounded-xl transition-all disabled:opacity-40 shrink-0"
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
