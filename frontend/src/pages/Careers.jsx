import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Building2, X, Loader2 } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

const TYPES = [
  { key: "all", label: "All" },
  { key: "internship", label: "Internships" },
  { key: "clerkship", label: "Clerkships" },
  { key: "associate", label: "Associate" },
  { key: "government", label: "Government" },
  { key: "judiciary", label: "Judiciary" },
  { key: "exam", label: "Exams" },
];

export default function Careers() {
  const [vacancies, setVacancies] = useState([]);
  const [type, setType] = useState("all");
  const [applyTo, setApplyTo] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", resume_url: "", cover_note: "" });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = type === "all" ? "" : `?type=${type}`;
    api.get(`/vacancies${params}`).then(({ data }) => setVacancies(data)).catch(() => {});
  }, [type]);

  const openApply = (v) => {
    if (!user) {
      toast.error("Sign in to apply.");
      navigate("/login");
      return;
    }
    setForm({ name: user.name || "", email: user.email || "", resume_url: "", cover_note: "" });
    setApplyTo(v);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post("/applications", { vacancy_id: applyTo.id, ...form });
      toast.success("Application submitted successfully.");
      setApplyTo(null);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12" data-testid="careers-page">
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Module 07</span>
      <h1 className="font-serif text-4xl sm:text-5xl font-light text-[#FFFFF0] mt-3">Careers &amp; Internships</h1>
      <p className="text-zinc-400 mt-4 max-w-2xl">
        Internships, judicial clerkships, associate positions, government vacancies and exam notifications — apply in a click.
      </p>

      <div className="flex flex-wrap gap-2 mt-10">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            data-testid={`career-filter-${t.key}`}
            className={`rounded-full px-5 py-2 text-sm font-medium border transition-all ${
              type === t.key ? "bg-[#FFFFF0] text-black border-[#FFFFF0]" : "border-white/10 text-zinc-400 hover:text-[#FFFFF0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-10">
        {vacancies.map((v) => (
          <div key={v.id} className="glass-card rounded-2xl p-8 flex flex-col" data-testid="vacancy-card">
            <div className="flex items-center gap-3 text-zinc-400 text-sm">
              <Building2 className="w-4 h-4 text-[#D4AF37]" /> {v.organization}
              <span className="text-zinc-600">·</span>
              <MapPin className="w-4 h-4" /> {v.location}
            </div>
            <h3 className="font-serif text-2xl text-[#FFFFF0] mt-4">{v.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mt-3 flex-1">{v.description}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              {(v.tags || []).map((tag) => (
                <span key={tag} className="font-mono text-[10px] uppercase tracking-[0.15em] border border-white/10 text-zinc-400 px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
              <span className="font-serif text-xl gold-text">{v.stipend || "As per norms"}</span>
              <button
                onClick={() => openApply(v)}
                data-testid="quick-apply-btn"
                className="rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Quick Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Apply modal */}
      {applyTo && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setApplyTo(null)} data-testid="apply-modal">
          <div className="glass-card rounded-3xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-2xl text-[#FFFFF0]">Apply — {applyTo.title}</h3>
              <button onClick={() => setApplyTo(null)} className="text-zinc-400 hover:text-[#FFFFF0]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 mt-6">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="apply-name" placeholder="Full name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0]" />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="apply-email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0]" />
              <input value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} data-testid="apply-resume" placeholder="Resume link (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0]" />
              <textarea value={form.cover_note} onChange={(e) => setForm({ ...form, cover_note: e.target.value })} data-testid="apply-note" rows={3} placeholder="Cover note (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0] resize-none" />
              <button onClick={submit} disabled={submitting || !form.name || !form.email} data-testid="submit-application-btn" className="w-full rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] disabled:opacity-40 px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
