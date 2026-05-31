import { useState, useEffect, useCallback } from "react";
import {
  Users, FileText, Newspaper, Scale, Briefcase, IndianRupee,
  Plus, Trash2, MessageSquare, Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0] placeholder:text-zinc-600";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass-card rounded-2xl p-6" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
      <Icon className="w-6 h-6 text-[#D4AF37]" />
      <div className="font-serif text-4xl text-[#FFFFF0] mt-4">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-2">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [legal, setLegal] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadAll = useCallback(async () => {
    const [s, a, n, l, v, ap, u] = await Promise.all([
      api.get("/admin/stats"), api.get("/articles"), api.get("/news"),
      api.get("/legal"), api.get("/vacancies"), api.get("/admin/applications"), api.get("/admin/users"),
    ]);
    setStats(s.data); setArticles(a.data); setNews(n.data); setLegal(l.data);
    setVacancies(v.data); setApplications(ap.data); setUsers(u.data);
  }, []);

  useEffect(() => { loadAll().catch(() => toast.error("Failed to load admin data.")); }, [loadAll]);

  // forms
  const [art, setArt] = useState({ title: "", category: "Legal Insight", excerpt: "", content: "", author: "JusticeVerse Editorial", read_time: "5 MIN READ", status: "published" });
  const [nw, setNw] = useState({ title: "", category: "Supreme Court", summary: "", source: "JusticeVerse Legal Reporter" });
  const [leg, setLeg] = useState({ title: "", doc_type: "case_law", court: "Supreme Court", category: "Supreme Court", citation: "", date: "", summary: "", source: "" });
  const [vac, setVac] = useState({ title: "", organization: "", type: "internship", location: "", stipend: "", description: "", tags: "" });

  const run = async (fn) => {
    setSaving(true);
    try { await fn(); await loadAll(); toast.success("Saved."); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed."); }
    finally { setSaving(false); }
  };

  const addArticle = () => run(async () => { await api.post("/admin/articles", art); setArt({ ...art, title: "", excerpt: "", content: "" }); });
  const addNews = () => run(async () => { await api.post("/admin/news", nw); setNw({ ...nw, title: "", summary: "" }); });
  const addLegal = () => run(async () => { await api.post("/admin/legal", leg); setLeg({ ...leg, title: "", citation: "", summary: "" }); });
  const addVac = () => run(async () => {
    await api.post("/admin/vacancies", { ...vac, tags: vac.tags.split(",").map((t) => t.trim()).filter(Boolean) });
    setVac({ ...vac, title: "", organization: "", description: "" });
  });

  const del = (path, id) => run(async () => { await api.delete(`/admin/${path}/${id}`); });

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12" data-testid="admin-dashboard-page">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Owner Console</span>
      <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FFFFF0] mt-3">Owner Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
        <StatCard icon={Users} label="Users" value={stats.users ?? "—"} />
        <StatCard icon={Scale} label="Judgments" value={stats.judgments ?? "—"} />
        <StatCard icon={FileText} label="Articles" value={stats.articles ?? "—"} />
        <StatCard icon={MessageSquare} label="AI Queries" value={stats.chat_messages ?? "—"} />
        <StatCard icon={Newspaper} label="News" value={stats.news ?? "—"} />
        <StatCard icon={Briefcase} label="Vacancies" value={stats.vacancies ?? "—"} />
        <StatCard icon={Briefcase} label="Applications" value={stats.applications ?? "—"} />
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${(stats.revenue ?? 0).toLocaleString("en-IN")}`} />
      </div>

      <Tabs defaultValue="articles" className="mt-12">
        <TabsList className="bg-white/5 border border-white/10 rounded-full p-1 flex flex-wrap h-auto gap-1">
          {["articles", "news", "judgments", "vacancies", "applications", "users"].map((t) => (
            <TabsTrigger key={t} value={t} data-testid={`admin-tab-${t}`} className="rounded-full px-5 py-2 text-xs font-mono uppercase tracking-[0.15em] data-[state=active]:bg-[#FFFFF0] data-[state=active]:text-black text-zinc-400">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ARTICLES */}
        <TabsContent value="articles" className="mt-8 space-y-6">
          <div className="glass-card rounded-2xl p-7 space-y-4" data-testid="article-form">
            <h3 className="font-serif text-2xl text-[#FFFFF0] flex items-center gap-2"><Plus className="w-5 h-5 text-[#D4AF37]" /> New Article</h3>
            <input className={inputCls} placeholder="Title" value={art.title} onChange={(e) => setArt({ ...art, title: e.target.value })} data-testid="art-title" />
            <div className="grid sm:grid-cols-3 gap-4">
              <input className={inputCls} placeholder="Category" value={art.category} onChange={(e) => setArt({ ...art, category: e.target.value })} />
              <input className={inputCls} placeholder="Author" value={art.author} onChange={(e) => setArt({ ...art, author: e.target.value })} />
              <input className={inputCls} placeholder="Read time" value={art.read_time} onChange={(e) => setArt({ ...art, read_time: e.target.value })} />
            </div>
            <textarea className={inputCls} rows={2} placeholder="Excerpt" value={art.excerpt} onChange={(e) => setArt({ ...art, excerpt: e.target.value })} />
            <textarea className={inputCls} rows={4} placeholder="Full content" value={art.content} onChange={(e) => setArt({ ...art, content: e.target.value })} />
            <button onClick={addArticle} disabled={saving || !art.title} className="rounded-full bg-[#FFFFF0] text-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 flex items-center gap-2" data-testid="add-article-btn">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Publish Article
            </button>
          </div>
          {articles.map((a) => (
            <div key={a.id} className="glass-card rounded-xl p-5 flex items-center justify-between" data-testid="admin-article-row">
              <div><div className="text-[#FFFFF0]">{a.title}</div><div className="font-mono text-[11px] text-zinc-500 mt-1">{a.category}</div></div>
              <button onClick={() => del("articles", a.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </TabsContent>

        {/* NEWS */}
        <TabsContent value="news" className="mt-8 space-y-6">
          <div className="glass-card rounded-2xl p-7 space-y-4">
            <h3 className="font-serif text-2xl text-[#FFFFF0] flex items-center gap-2"><Plus className="w-5 h-5 text-[#D4AF37]" /> New News Item</h3>
            <input className={inputCls} placeholder="Title" value={nw.title} onChange={(e) => setNw({ ...nw, title: e.target.value })} data-testid="news-title" />
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputCls} placeholder="Category" value={nw.category} onChange={(e) => setNw({ ...nw, category: e.target.value })} />
              <input className={inputCls} placeholder="Source" value={nw.source} onChange={(e) => setNw({ ...nw, source: e.target.value })} />
            </div>
            <textarea className={inputCls} rows={3} placeholder="Summary" value={nw.summary} onChange={(e) => setNw({ ...nw, summary: e.target.value })} />
            <button onClick={addNews} disabled={saving || !nw.title} className="rounded-full bg-[#FFFFF0] text-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50" data-testid="add-news-btn">Publish News</button>
          </div>
          {news.map((n) => (
            <div key={n.id} className="glass-card rounded-xl p-5 flex items-center justify-between">
              <div><div className="text-[#FFFFF0]">{n.title}</div><div className="font-mono text-[11px] text-zinc-500 mt-1">{n.category} · {n.date}</div></div>
              <button onClick={() => del("news", n.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </TabsContent>

        {/* JUDGMENTS */}
        <TabsContent value="judgments" className="mt-8 space-y-6">
          <div className="glass-card rounded-2xl p-7 space-y-4">
            <h3 className="font-serif text-2xl text-[#FFFFF0] flex items-center gap-2"><Plus className="w-5 h-5 text-[#D4AF37]" /> Upload Judgment / Statute</h3>
            <input className={inputCls} placeholder="Title" value={leg.title} onChange={(e) => setLeg({ ...leg, title: e.target.value })} data-testid="legal-title" />
            <div className="grid sm:grid-cols-2 gap-4">
              <select className={inputCls} value={leg.doc_type} onChange={(e) => setLeg({ ...leg, doc_type: e.target.value })}>
                <option value="case_law">Case Law</option><option value="statute">Statute</option><option value="journal">Journal</option>
              </select>
              <select className={inputCls} value={leg.category} onChange={(e) => setLeg({ ...leg, category: e.target.value })}>
                <option>Supreme Court</option><option>High Court</option><option>Statutes</option><option>Corporate</option>
              </select>
              <input className={inputCls} placeholder="Citation" value={leg.citation} onChange={(e) => setLeg({ ...leg, citation: e.target.value })} />
              <input className={inputCls} placeholder="Date (YYYY-MM-DD)" value={leg.date} onChange={(e) => setLeg({ ...leg, date: e.target.value })} />
              <input className={inputCls} placeholder="Source" value={leg.source} onChange={(e) => setLeg({ ...leg, source: e.target.value })} />
            </div>
            <textarea className={inputCls} rows={3} placeholder="Summary" value={leg.summary} onChange={(e) => setLeg({ ...leg, summary: e.target.value })} />
            <button onClick={addLegal} disabled={saving || !leg.title} className="rounded-full bg-[#FFFFF0] text-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50" data-testid="add-legal-btn">Add to Database</button>
          </div>
          {legal.map((d) => (
            <div key={d.id} className="glass-card rounded-xl p-5 flex items-center justify-between">
              <div><div className="text-[#FFFFF0]">{d.title}</div><div className="font-mono text-[11px] text-zinc-500 mt-1">{d.category} · {d.citation}</div></div>
              <button onClick={() => del("legal", d.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </TabsContent>

        {/* VACANCIES */}
        <TabsContent value="vacancies" className="mt-8 space-y-6">
          <div className="glass-card rounded-2xl p-7 space-y-4">
            <h3 className="font-serif text-2xl text-[#FFFFF0] flex items-center gap-2"><Plus className="w-5 h-5 text-[#D4AF37]" /> New Vacancy</h3>
            <input className={inputCls} placeholder="Title" value={vac.title} onChange={(e) => setVac({ ...vac, title: e.target.value })} data-testid="vac-title" />
            <div className="grid sm:grid-cols-2 gap-4">
              <input className={inputCls} placeholder="Organization" value={vac.organization} onChange={(e) => setVac({ ...vac, organization: e.target.value })} />
              <select className={inputCls} value={vac.type} onChange={(e) => setVac({ ...vac, type: e.target.value })}>
                <option value="internship">Internship</option><option value="clerkship">Clerkship</option><option value="associate">Associate</option><option value="government">Government</option><option value="judiciary">Judiciary</option><option value="exam">Exam</option>
              </select>
              <input className={inputCls} placeholder="Location" value={vac.location} onChange={(e) => setVac({ ...vac, location: e.target.value })} />
              <input className={inputCls} placeholder="Stipend (e.g. Rs. 15,000 / Month)" value={vac.stipend} onChange={(e) => setVac({ ...vac, stipend: e.target.value })} />
            </div>
            <input className={inputCls} placeholder="Tags (comma separated)" value={vac.tags} onChange={(e) => setVac({ ...vac, tags: e.target.value })} />
            <textarea className={inputCls} rows={3} placeholder="Description" value={vac.description} onChange={(e) => setVac({ ...vac, description: e.target.value })} />
            <button onClick={addVac} disabled={saving || !vac.title} className="rounded-full bg-[#FFFFF0] text-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50" data-testid="add-vacancy-btn">Post Vacancy</button>
          </div>
          {vacancies.map((v) => (
            <div key={v.id} className="glass-card rounded-xl p-5 flex items-center justify-between">
              <div><div className="text-[#FFFFF0]">{v.title}</div><div className="font-mono text-[11px] text-zinc-500 mt-1">{v.organization} · {v.type}</div></div>
              <button onClick={() => del("vacancies", v.id)} className="text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </TabsContent>

        {/* APPLICATIONS */}
        <TabsContent value="applications" className="mt-8 space-y-3">
          {applications.length === 0 ? <p className="text-zinc-600 font-mono text-sm">No applications yet.</p> :
            applications.map((a) => (
              <div key={a.id} className="glass-card rounded-xl p-5" data-testid="admin-application-row">
                <div className="text-[#FFFFF0]">{a.name} — <span className="text-zinc-400">{a.vacancy_title}</span></div>
                <div className="font-mono text-[11px] text-zinc-500 mt-1">{a.email} · {a.status}</div>
              </div>
            ))}
        </TabsContent>

        {/* USERS */}
        <TabsContent value="users" className="mt-8 space-y-3">
          {users.map((u) => (
            <div key={u.user_id} className="glass-card rounded-xl p-5 flex items-center justify-between" data-testid="admin-user-row">
              <div><div className="text-[#FFFFF0]">{u.name}</div><div className="font-mono text-[11px] text-zinc-500 mt-1">{u.email}</div></div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#D4AF37]">{u.plan}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{u.role}</span>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
