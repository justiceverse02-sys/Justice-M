import { ShieldAlert } from "lucide-react";

export const Disclaimer = ({ className = "" }) => (
  <div
    className={`flex items-start gap-3 text-xs text-zinc-500 font-mono leading-relaxed ${className}`}
    data-testid="legal-disclaimer"
  >
    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-[#D4AF37]" />
    <span>
      AI responses are for legal research assistance only and do not constitute legal advice.
    </span>
  </div>
);

export default Disclaimer;
