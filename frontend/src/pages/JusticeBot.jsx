import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Globe, Loader2, User } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";
import { toast } from "@/components/ui/sonner";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "gu", label: "ગુજરાતી" },
];

const SUGGESTIONS = [
  "Explain Section 313 CrPC",
  "Explain Section 223 BNSS",
  "Summarise the law on anticipatory bail",
  "What is the rule on electronic evidence under Section 65B?",
];

export default function JusticeBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setLoading(true);
    try {
      const { data } = await api.post("/chat", { message: content, session_id: sessionId, language });
      setSessionId(data.session_id);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      const msg = formatApiErrorDetail(e.response?.data?.detail) || e.message;
      toast.error(msg);
      setMessages((m) => [...m, { role: "assistant", content: msg, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-12 min-h-[80vh] flex flex-col" data-testid="justicebot-page">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37] flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Module 01
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FFFFF0] mt-3">JusticeBot AI</h1>
        </div>
        <div className="flex items-center gap-2 glass-card rounded-full px-2 py-2" data-testid="language-selector">
          <Globe className="w-4 h-4 text-zinc-500 ml-2" />
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              data-testid={`lang-${l.code}`}
              className={`rounded-full px-3 py-1.5 text-xs font-mono transition-all ${
                language === l.code ? "bg-[#FFFFF0] text-black" : "text-zinc-400 hover:text-[#FFFFF0]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-3xl flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-[42vh]" data-testid="chat-messages">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-full border border-[#D4AF37]/40 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <p className="font-serif text-2xl text-[#FFFFF0]">Ask anything about Indian law</p>
              <p className="text-sm text-zinc-500 mt-2 max-w-md">
                Legal research, statute explanations, case summaries and citations — grounded in verified sources.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-8 max-w-xl">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    data-testid="suggestion-chip"
                    className="font-mono text-[11px] border border-white/10 text-zinc-300 hover:border-[#D4AF37]/50 hover:text-[#FFFFF0] px-4 py-2 rounded-full transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`} data-testid={`msg-${m.role}`}>
              {m.role === "assistant" && (
                <div className="w-9 h-9 rounded-full border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-white/[0.06] border border-white/10 text-[#FFFFF0]"
                    : m.error
                    ? "bg-red-500/10 border border-red-500/30 text-red-300"
                    : "bg-white/[0.02] border border-[#D4AF37]/20 text-zinc-200"
                }`}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="w-9 h-9 rounded-full bg-[#FFFFF0] text-black flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-full border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="bg-white/[0.02] border border-[#D4AF37]/20 rounded-2xl px-5 py-4 flex items-center gap-2 text-zinc-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> Researching…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-white/5 p-4">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              data-testid="chat-input"
              rows={1}
              placeholder="Ask JusticeBot a legal question…"
              className="flex-1 bg-transparent resize-none outline-none text-[#FFFFF0] placeholder:text-zinc-600 text-sm py-3 px-2 max-h-32"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              data-testid="chat-send-btn"
              className="rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] disabled:opacity-40 w-11 h-11 flex items-center justify-center transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Disclaimer className="mt-5 justify-center" />
    </div>
  );
}
