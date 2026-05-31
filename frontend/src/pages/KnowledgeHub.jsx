import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, X } from "lucide-react";
import api from "@/lib/api";

export default function KnowledgeHub() {
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [active, setActive] = useState(null);
  const [newsFilter, setNewsFilter] = useState("All");

  useEffect(() => {
    api.get("/articles").then(({ data }) => setArticles(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const params = newsFilter === "All" ? "" : `?category=${encodeURIComponent(newsFilter)}`;
    api.get(`/news${params}`).then(({ data }) => setNews(data)).catch(() => {});
  }, [newsFilter]);

  const NEWS_FILTERS = ["All", "Supreme Court", "High Court", "Statutes", "Corporate"];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12" data-testid="knowledge-hub-page">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Module 06</span>
      <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FFFFF0] mt-3">Knowledge Hub</h1>

      {/* Articles */}
      <div className="flex items-end justify-between mt-14 mb-8">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#FFFFF0]">Articles &amp; Insights Publications</h2>
          <p className="text-zinc-400 mt-2">Read vetted legal analyses, contract assemblies, and evidentiary dispatches.</p>
        </div>
      </div>

      <div className="space-y-5">
        {articles.map((a) => (
          <article key={a.id} className="glass-card rounded-2xl p-8" data-testid="article-card">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]">{a.category}</span>
              <span className="font-mono text-[11px] text-zinc-500">{a.read_time}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#FFFFF0] mt-4 leading-snug">{a.title}</h3>
            <p className="text-zinc-400 leading-relaxed mt-3">{a.excerpt}</p>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
              <span className="text-sm text-zinc-500">By <span className="text-zinc-300">{a.author}</span></span>
              <button
                onClick={() => setActive(a)}
                data-testid="read-paper-btn"
                className="flex items-center gap-2 font-semibold text-sm text-[#FFFFF0] hover:text-[#D4AF37] transition-colors"
              >
                Read Paper <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* News */}
      <div className="mt-20">
        <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#FFFFF0]">Legal News &amp; Daily Digest</h2>
        <div className="flex flex-wrap gap-2 mt-6 glass-card rounded-full p-2 w-fit">
          {NEWS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setNewsFilter(f)}
              data-testid={`news-filter-${f.replace(/\s/g, "-")}`}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                newsFilter === f ? "bg-[#FFFFF0] text-black" : "text-zinc-400 hover:text-[#FFFFF0]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-8">
          {news.map((n) => (
            <div key={n.id} className="glass-card rounded-2xl p-8" data-testid="news-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] bg-white/5 border border-white/10 text-zinc-300 px-3 py-1 rounded-full">{n.category}</span>
                <span className="font-mono text-[11px] text-zinc-500">• {n.date}</span>
              </div>
              <h3 className="font-serif text-2xl text-[#FFFFF0]">{n.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mt-3">{n.summary}</p>
              <div className="mt-5 pt-5 border-t border-white/5">
                <span className="font-mono text-[11px] text-zinc-500">LEGAL SOURCE: <span className="text-zinc-300">{n.source}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article reader */}
      {active && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-10 overflow-y-auto" onClick={() => setActive(null)} data-testid="article-modal">
          <div className="glass-card rounded-3xl max-w-3xl w-full p-8 sm:p-12 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {active.category}
              </span>
              <button onClick={() => setActive(null)} data-testid="close-article-btn" className="text-zinc-400 hover:text-[#FFFFF0]">
                <X className="w-6 h-6" />
              </button>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#FFFFF0] mt-5 leading-snug">{active.title}</h2>
            <p className="text-sm text-zinc-500 mt-3">By {active.author} · {active.read_time}</p>
            <div className="text-zinc-300 leading-relaxed mt-8 whitespace-pre-wrap">{active.content || active.excerpt}</div>
          </div>
        </div>
      )}
    </div>
  );
}
