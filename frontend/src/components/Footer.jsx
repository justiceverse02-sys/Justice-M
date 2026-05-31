import { Link } from "react-router-dom";
import { Scale } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-white/5 bg-[#0A0A0A] mt-24" data-testid="footer">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
      <div className="grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <Scale className="w-7 h-7 text-[#D4AF37]" />
            <span className="font-serif text-2xl tracking-[0.18em] text-[#FFFFF0]">JUSTICE VERSE</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
            India's most advanced AI legal workspace for lawyers, judges, students, researchers and
            law firms. Democratizing law through technology.
          </p>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-5">Modules</h4>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li><Link to="/justicebot" className="hover:text-[#D4AF37]">JusticeVerse AI</Link></li>
            <li><Link to="/counsel" className="hover:text-[#D4AF37]">Counsel AI</Link></li>
            <li><Link to="/cases" className="hover:text-[#D4AF37]">Cases &amp; Interpretation</Link></li>
            <li><Link to="/knowledge-hub" className="hover:text-[#D4AF37]">Knowledge Hub</Link></li>
            <li><Link to="/careers" className="hover:text-[#D4AF37]">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-5">Platform</h4>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li><Link to="/pricing" className="hover:text-[#D4AF37]">Subscription</Link></li>
            <li><Link to="/register" className="hover:text-[#D4AF37]">Create Account</Link></li>
            <li><Link to="/login" className="hover:text-[#D4AF37]">Sign In</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-zinc-600" />
          <span className="font-mono text-xs tracking-[0.15em] text-zinc-500">
            © 2026 JUSTICEVERSE GLOBAL SERVICES CO.
          </span>
        </div>
        <span className="font-mono text-xs tracking-[0.15em] text-zinc-600">
          TERMS &amp; PRIVACY COVENANTS &nbsp;|&nbsp; ADVANCING LAW GLOBALLY
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
