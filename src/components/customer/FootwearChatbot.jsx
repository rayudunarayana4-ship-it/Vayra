import { Bot, ChevronDown, LoaderCircle, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "/chat-api";
const INITIAL_MESSAGE = {
  role: "assistant",
  content: "Hi, I’m VAYRA’s footwear assistant. I can help with styles, sizing, materials, care, and finding your next pair.",
};

function endpoint(path) {
  return `${CHAT_API_URL.replace(/\/$/, "")}${path}`;
}

export function FootwearChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationId(null);
    setError("");
    setDraft("");
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;

    setMessages((items) => [...items, { role: "user", content: message }]);
    setDraft("");
    setError("");
    setIsSending(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversation_id: conversationId }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || "The assistant is unavailable right now.");
      setConversationId(result.conversation_id || null);
      setMessages((items) => [...items, {
        role: "assistant",
        content: result.answer || "I couldn’t generate a reply. Please try again.",
        sources: result.sources || [],
      }]);
    } catch (requestError) {
      setError(requestError.name === "AbortError"
        ? "The response took too long. Please try again."
        : requestError.message);
    } finally {
      window.clearTimeout(timeout);
      setIsSending(false);
    }
  };

  return (
    <section className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6" aria-label="VAYRA footwear assistant">
      {isOpen && (
        <div className="mb-3 flex h-[min(600px,calc(100vh-7rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-[#C5A059]/40 bg-[#101010] shadow-2xl shadow-black/70 sm:w-[390px]">
          <header className="flex items-center gap-3 border-b border-white/10 bg-[#181818] px-4 py-3.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#C5A059] text-black"><Bot size={19} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-sm font-bold tracking-wide text-white">VAYRA Assistant</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#C5A059]">Footwear specialist</p>
            </div>
            <button type="button" onClick={resetChat} className="rounded p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white" aria-label="Start a new chat" title="New chat"><RotateCcw size={16} /></button>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded p-2 text-neutral-400 transition hover:bg-white/10 hover:text-white" aria-label="Close chat"><X size={18} /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((item, index) => (
              <article key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${item.role === "user" ? "rounded-br-sm bg-[#C5A059] text-black" : "rounded-bl-sm bg-neutral-800 text-neutral-100"}`}>
                  <p className="whitespace-pre-wrap">{item.content}</p>
                  {item.sources?.length > 0 && <p className="mt-2 border-t border-white/10 pt-2 text-[9px] uppercase tracking-wider text-neutral-400">Sources: {item.sources.map((source) => source.title).filter(Boolean).join(", ")}</p>}
                </div>
              </article>
            ))}
            {isSending && <div className="flex items-center gap-2 px-2 text-xs text-neutral-400"><LoaderCircle size={15} className="animate-spin text-[#C5A059]" /> Thinking about the best fit…</div>}
            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-200">{error}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-white/10 bg-[#151515] p-3">
            <label className="sr-only" htmlFor="vayra-chat-message">Ask a footwear question</label>
            <div className="flex items-end gap-2 rounded-xl border border-white/15 bg-black px-3 py-2 focus-within:border-[#C5A059]">
              <textarea ref={inputRef} id="vayra-chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) sendMessage(event); }} rows={1} maxLength={1000} placeholder="Ask about sizing, styles or care…" className="max-h-24 min-h-5 flex-1 resize-none bg-transparent text-xs text-white outline-none placeholder:text-neutral-500" />
              <button type="submit" disabled={!draft.trim() || isSending} className="grid h-8 w-8 place-items-center rounded-lg bg-[#C5A059] text-black transition hover:bg-[#e0bd76] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send size={15} /></button>
            </div>
            <p className="mt-2 text-center text-[9px] text-neutral-500">AI answers may be imperfect. Please confirm important product details.</p>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setIsOpen((value) => !value)} className="ml-auto flex items-center gap-2 rounded-full border border-[#C5A059]/60 bg-[#C5A059] px-4 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-black/40 transition hover:bg-[#e0bd76]" aria-expanded={isOpen} aria-controls="vayra-chat-message">
        {isOpen ? <><ChevronDown size={17} /> Hide chat</> : <><MessageCircle size={18} /> Need help?</>}
      </button>
    </section>
  );
}
