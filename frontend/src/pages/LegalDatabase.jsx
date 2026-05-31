import { useState, useEffect, useCallback } from "react";
import { Search, FileText, Scale, Loader2, BookMarked } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

const FILTERS = ["All", "Supreme Court", "High Court", "Statutes", "Corporate"];

export default function LegalDatabase() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category !== "All") params.set("category", category);
      const { data } = await api.get(`/legal?${params.toString()}`);
      setItems(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [q, category]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const save = async (item) => {
    if (!user) {
      toast.error("Sign in to save judgments to your library.");
      return;
    }
    try {
      await api.post("/saved", { item_type: "judgment", item_id: item.id, title: item.title });
      toast.success("Saved to your library.");
    } catch {
      toast.error("Could not save.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12" data-testid="legal-database-page">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Module 02</span>
      <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FFFFF0] mt-3">Indian Legal Database</h1>
      <p className="text-zinc-400 mt-4 max-w-2xl">
        Case laws, statutes & journals — regional court reports and corporate regulations indexed from 1947 onwards.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mt-10 glass-card rounded-full p-2 w-fit" data-testid="db-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setCategory(f)}
            data-testid={`filter-${f.replace(/\s/g, "-")}`}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              category === f ? "bg-[#FFFFF0] text-black" : "text-zinc-400 hover:text-[#FFFFF0]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          data-testid="db-search-input"
          placeholder="Search regulatory dispatches, orders, or acts…"
          className="w-full glass-card rounded-2xl pl-16 pr-6 py-5 bg-transparent outline-none text-[#FFFFF0] placeholder:text-zinc-600 focus:border-[#D4AF37]/40"
        />
      </div>

      {/* Results */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 font-mono text-sm">No documents found.</div>
        ) : (
          items.map((d) => (
            <div key={d.id} className="glass-card rounded-2xl p-7" data-testid="legal-result-card">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] bg-white/5 border border-white/10 text-zinc-300 px-3 py-1 rounded-full">
                  {d.category}
                </span>
                {d.citation && <span className="font-mono text-xs text-[#D4AF37]">{d.citation}</span>}
                <span className="font-mono text-[11px] text-zinc-500">• {d.date}</span>
              </div>
              <h3 className="font-serif text-2xl text-[#FFFFF0] mt-4 flex items-start gap-3">
                {d.doc_type === "statute" ? <Scale className="w-5 h-5 text-[#D4AF37] mt-1.5 shrink-0" /> : <FileText className="w-5 h-5 text-[#D4AF37] mt-1.5 shrink-0" />}
                {d.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed mt-3">{d.summary}</p>
              <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/5">
                <span className="font-mono text-[11px] text-zinc-500">
                  LEGAL SOURCE: <span className="text-zinc-300">{d.source}</span>
                </span>
                <button
                  onClick={() => save(d)}
                  data-testid="save-judgment-btn"
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#D4AF37] hover:opacity-80"
                >
                  <BookMarked className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
