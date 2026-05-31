import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookMarked, Briefcase, MessageSquare, Crown, Trash2, Sparkles, Search } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [apps, setApps] = useState([]);
  const [sessions, setSessions] = useState([]);

  const loadSaved = () => api.get("/saved").then(({ data }) => setSaved(data)).catch(() => {});

  useEffect(() => {
    loadSaved();
    api.get("/my/applications").then(({ data }) => setApps(data)).catch(() => {});
    api.get("/chat/sessions").then(({ data }) => setSessions(data)).catch(() => {});
  }, []);

  const removeSaved = async (id) => {
    try {
      await api.delete(`/saved/${id}`);
      setSaved((s) => s.filter((x) => x.id !== id));
      toast.success("Removed.");
    } catch {
      toast.error("Failed.");
    }
  };

  const planLabel = { free: "Free", student: "Student", advocate: "Advocate", lawfirm: "Law Firm" };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12" data-testid="dashboard-page">
      {/* Header */}
      <div className="glass-card rounded-3xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#FFFFF0] text-black flex items-center justify-center font-serif text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="font-serif text-3xl text-[#FFFFF0]">{user?.name}</h1>
            <p className="text-zinc-500 text-sm">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] border border-[#D4AF37]/40 text-[#D4AF37] px-4 py-2 rounded-full">
            <Crown className="w-4 h-4" /> {planLabel[user?.plan] || "Free"} Plan
          </span>
          {user?.plan === "free" && (
            <Link to="/pricing" data-testid="upgrade-link" className="rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-5 mt-6">
        <Link to="/justicebot" className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all" data-testid="quick-justicebot">
          <Sparkles className="w-7 h-7 text-[#D4AF37]" />
          <h3 className="font-serif text-xl text-[#FFFFF0] mt-4">Ask JusticeBot</h3>
          <p className="text-sm text-zinc-500 mt-1">AI legal research</p>
        </Link>
        <Link to="/database" className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all" data-testid="quick-database">
          <Search className="w-7 h-7 text-[#D4AF37]" />
          <h3 className="font-serif text-xl text-[#FFFFF0] mt-4">Search Database</h3>
          <p className="text-sm text-zinc-500 mt-1">Judgments & statutes</p>
        </Link>
        <Link to="/careers" className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all" data-testid="quick-careers">
          <Briefcase className="w-7 h-7 text-[#D4AF37]" />
          <h3 className="font-serif text-xl text-[#FFFFF0] mt-4">Browse Careers</h3>
          <p className="text-sm text-zinc-500 mt-1">Internships & jobs</p>
        </Link>
      </div>

      {/* Grid: saved + applications + chats */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <section className="glass-card rounded-2xl p-7">
          <h2 className="font-serif text-2xl text-[#FFFFF0] flex items-center gap-3"><BookMarked className="w-5 h-5 text-[#D4AF37]" /> Saved Library</h2>
          <div className="mt-5 space-y-3">
            {saved.length === 0 ? (
              <p className="text-sm text-zinc-600 font-mono">No saved items yet.</p>
            ) : (
              saved.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3" data-testid="saved-item">
                  <span className="text-sm text-zinc-300 truncate pr-3">{s.title}</span>
                  <button onClick={() => removeSaved(s.id)} className="text-zinc-500 hover:text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-2xl p-7">
          <h2 className="font-serif text-2xl text-[#FFFFF0] flex items-center gap-3"><Briefcase className="w-5 h-5 text-[#D4AF37]" /> My Applications</h2>
          <div className="mt-5 space-y-3">
            {apps.length === 0 ? (
              <p className="text-sm text-zinc-600 font-mono">No applications submitted.</p>
            ) : (
              apps.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3" data-testid="application-item">
                  <span className="text-sm text-zinc-300 truncate pr-3">{a.vacancy_title}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#D4AF37] shrink-0">{a.status}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-2xl p-7 lg:col-span-2">
          <h2 className="font-serif text-2xl text-[#FFFFF0] flex items-center gap-3"><MessageSquare className="w-5 h-5 text-[#D4AF37]" /> Research History</h2>
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-zinc-600 font-mono">No JusticeBot conversations yet.</p>
            ) : (
              sessions.map((s) => (
                <div key={s.session_id} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 truncate" data-testid="chat-session-item">
                  {s.title}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
