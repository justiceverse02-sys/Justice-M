import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Scale, Search, FileText, GraduationCap, Briefcase, BookOpen,
  Gavel, Building2, ArrowRight, Sparkles, Quote,
} from "lucide-react";
import api from "@/lib/api";
import { Disclaimer } from "@/components/Disclaimer";

const HERO_BG =
  "https://static.prod-images.emergentagent.com/jobs/e8e2ab20-531a-4e8a-8ea0-d87bf94da2cc/images/445c81c745ca3d176712e81188522531aa2f68336af5096d26ba9f3dbd7103f5.png";

const MODULES = [
  { icon: Sparkles, title: "JusticeBot AI", desc: "Conversational legal research with citations, case summaries and answers in English, Hindi & Gujarati.", to: "/justicebot" },
  { icon: Search, title: "Indian Legal Database", desc: "Search Supreme Court, High Court, Tribunal & statute archives from 1947 onwards.", to: "/database" },
  { icon: FileText, title: "CaseBrief AI", desc: "Upload judgments to auto-generate briefs, timelines, ratio decidendi & citations.", to: "/justicebot" },
  { icon: Gavel, title: "DraftGen AI", desc: "Generate bail applications, writs, plaints, NDAs & corporate agreements.", to: "/justicebot" },
  { icon: GraduationCap, title: "PrepMate AI", desc: "Judiciary & law exam prep — quizzes, mock tests, bare-act learning & study plans.", to: "/justicebot" },
  { icon: BookOpen, title: "Knowledge Hub", desc: "Vetted articles, research papers & an AI-summarised daily legal news digest.", to: "/knowledge-hub" },
  { icon: Briefcase, title: "Careers & Internships", desc: "Internships, clerkships, associate roles & government legal vacancies.", to: "/careers" },
  { icon: Building2, title: "Law Firm Workspace", desc: "Matter management, hearing tracker, calendar & team collaboration for firms.", to: "/pricing" },
];

const STATS = [
  { value: "1947+", label: "Judgments Indexed" },
  { value: "3", label: "Languages Supported" },
  { value: "8", label: "AI Workspaces" },
  { value: "24/7", label: "Research Assistant" },
];

const fade = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

export default function Home() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get("/news?limit=2").then(({ data }) => setNews(data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/80" />
        <div className="absolute inset-0 gold-glow" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-28 w-full">
          <motion.div initial="hidden" animate="show" variants={fade} custom={0}>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-4 py-1.5">
              <Scale className="w-3.5 h-3.5" /> India's Premier Legal AI Workspace
            </span>
          </motion.div>
          <motion.h1
            initial="hidden" animate="show" variants={fade} custom={1}
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-light leading-[1.02] tracking-tight text-[#FFFFF0] mt-8 max-w-4xl"
          >
            Democratizing Law<br />Through <span className="gold-text italic">Technology</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="show" variants={fade} custom={2}
            className="text-zinc-400 text-base sm:text-lg leading-relaxed mt-8 max-w-2xl"
          >
            India's most advanced AI legal workspace for lawyers, judges, students, researchers and
            law firms.
          </motion.p>
          <motion.div
            initial="hidden" animate="show" variants={fade} custom={3}
            className="flex flex-col sm:flex-row gap-4 mt-12"
          >
            <Link
              to="/justicebot"
              data-testid="hero-justicebot-btn"
              className="group rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] px-8 py-4 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              Consult JusticeBot AI
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/knowledge-hub"
              data-testid="hero-knowledge-btn"
              className="rounded-full bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-8 py-4 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center"
            >
              Explore Knowledge Hub
            </Link>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
          {STATS.map((s) => (
            <div key={s.label} className="py-10 px-4 text-center">
              <div className="font-serif text-4xl sm:text-5xl text-[#FFFFF0]">{s.value}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-3">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MODULES */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        <div className="max-w-2xl mb-14">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37]">The Workspace</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#FFFFF0] mt-4">
            Eight intelligent modules. One verdict-grade platform.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.title}
                initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade} custom={i}
              >
                <Link
                  to={m.to}
                  data-testid={`module-card-${i}`}
                  className="glass-card rounded-2xl p-7 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 block"
                >
                  <Icon className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
                  <h3 className="font-serif text-2xl text-[#FFFFF0] mt-6">{m.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mt-3 flex-1">{m.desc}</p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] mt-6 flex items-center gap-2">
                    Enter <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* QUOTE / RAG explainer */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <div className="glass-card rounded-3xl p-10 sm:p-16 relative overflow-hidden">
          <Quote className="w-12 h-12 text-[#D4AF37]/30 mb-6" />
          <p className="font-serif text-2xl sm:text-4xl font-light leading-snug text-[#FFFFF0] max-w-4xl">
            Every answer is grounded in verified legal sources — citing relevant sections, case law,
            court details and source links through a retrieval-augmented architecture.
          </p>
          <div className="mt-10">
            <Disclaimer />
          </div>
        </div>
      </section>

      {/* NEWS PREVIEW */}
      {news.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#FFFFF0]">Latest Legal News</h2>
            <Link to="/knowledge-hub" className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF37] flex items-center gap-2">
              All Updates <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {news.map((n) => (
              <div key={n.id} className="glass-card rounded-2xl p-8" data-testid="home-news-card">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] bg-white/5 border border-white/10 text-zinc-300 px-3 py-1 rounded-full">{n.category}</span>
                  <span className="font-mono text-[11px] text-zinc-500">{n.date}</span>
                </div>
                <h3 className="font-serif text-2xl text-[#FFFFF0]">{n.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed mt-3">{n.summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
