import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gavel, Loader2, Copy, Download, Sparkles } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Disclaimer } from "@/components/Disclaimer";
import { toast } from "@/components/ui/sonner";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DRAFT_GROUPS = [
  { group: "Criminal", items: ["Bail Application", "Anticipatory Bail Application", "Discharge Application", "Revision Petition", "Criminal Appeal"] },
  { group: "Civil", items: ["Plaint", "Written Statement", "Injunction Application"] },
  { group: "Constitutional", items: ["Writ Petition", "Special Leave Petition (SLP)"] },
  { group: "Corporate", items: ["Non-Disclosure Agreement (NDA)", "Shareholder Agreement", "Employment Agreement"] },
];

const LANGS = [
  { code: "en", label: "English" }, { code: "hi", label: "हिन्दी · Hindi" }, { code: "gu", label: "ગુજરાતી · Gujarati" },
  { code: "mr", label: "मराठी · Marathi" }, { code: "ta", label: "தமிழ் · Tamil" }, { code: "te", label: "తెలుగు · Telugu" },
  { code: "bn", label: "বাংলা · Bengali" }, { code: "kn", label: "ಕನ್ನಡ · Kannada" }, { code: "pa", label: "ਪੰਜਾਬੀ · Punjabi" },
  { code: "ml", label: "മലയാളം · Malayalam" }, { code: "ur", label: "اردو · Urdu" },
];

export default function CounselAI() {
  const [draftType, setDraftType] = useState("Bail Application");
  const [language, setLanguage] = useState("en");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const generate = async () => {
    if (!user) {
      toast.error("Sign in to use Counsel AI drafting.");
      navigate("/login");
      return;
    }
    if (!details.trim()) {
      toast.error("Add the matter details first.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const { data } = await api.post("/draft", { draft_type: draftType, details, language });
      setResult(data.draft);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => { navigator.clipboard.writeText(result); toast.success("Copied to clipboard."); };
  const download = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draftType.replace(/[^a-z0-9]/gi, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12" data-testid="counsel-ai-page">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37] flex items-center gap-2">
        <Gavel className="w-4 h-4" /> Counsel AI
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FFFFF0] mt-3">VerseDraft Studio</h1>
      <p className="text-zinc-400 mt-4 max-w-2xl">
        Generate professional, ready-to-edit legal drafts — applications, petitions, pleadings and agreements — in seconds.
      </p>

      <div className="grid lg:grid-cols-2 gap-6 mt-10">
        {/* Composer */}
        <div className="glass-card rounded-3xl p-7 space-y-5" data-testid="draft-composer">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Document Type</label>
            <Select value={draftType} onValueChange={setDraftType}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 rounded-xl text-sm text-[#FFFFF0]" data-testid="draft-type-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-white/10 text-[#FFFFF0] max-h-80">
                {DRAFT_GROUPS.map((g) => (
                  <SelectGroup key={g.group}>
                    <SelectLabel className="text-[#D4AF37] font-mono text-[10px] uppercase tracking-[0.2em]">{g.group}</SelectLabel>
                    {g.items.map((it) => (
                      <SelectItem key={it} value={it} className="text-sm focus:bg-white/10 focus:text-[#FFFFF0]">{it}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Output Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 rounded-xl text-sm text-[#FFFFF0]" data-testid="draft-lang-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#141414] border-white/10 text-[#FFFFF0] max-h-72">
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code} className="text-sm focus:bg-white/10 focus:text-[#FFFFF0]">{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Matter Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              data-testid="draft-details"
              rows={8}
              placeholder="Describe the parties, facts, court, grounds and any specifics. e.g. 'Anticipatory bail for accused in FIR No. 123/2026 u/s 420 BNS, Sessions Court Delhi…'"
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0] resize-none"
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            data-testid="generate-draft-btn"
            className="w-full rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] disabled:opacity-50 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Drafting…" : "Generate Draft"}
          </button>
        </div>

        {/* Output */}
        <div className="glass-card rounded-3xl p-7 flex flex-col" data-testid="draft-output">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl text-[#FFFFF0]">Draft Output</h3>
            {result && (
              <div className="flex items-center gap-3">
                <button onClick={copy} data-testid="copy-draft-btn" className="text-zinc-400 hover:text-[#D4AF37]" title="Copy"><Copy className="w-4 h-4" /></button>
                <button onClick={download} data-testid="download-draft-btn" className="text-zinc-400 hover:text-[#D4AF37]" title="Download"><Download className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto min-h-[40vh]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" /> Composing your {draftType.toLowerCase()}…
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-200 leading-relaxed" data-testid="draft-text">{result}</pre>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-zinc-600 text-sm px-6">
                Your generated draft will appear here, ready to copy or download.
              </div>
            )}
          </div>
        </div>
      </div>

      <Disclaimer className="mt-6 justify-center" />
    </div>
  );
}
