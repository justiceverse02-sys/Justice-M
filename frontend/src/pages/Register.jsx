import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

const SCALES =
  "https://static.prod-images.emergentagent.com/jobs/e8e2ab20-531a-4e8a-8ea0-d87bf94da2cc/images/2f2c3901146e2ffea21b042f8e1456842b00baefafd44feb9222ea03bdb7e4d9.png";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2 1.5-4.7 2.5-7.6 2.5-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5h-1.9V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5c-.5.4 6.8-5 6.8-15 0-1.3-.1-2.3-.9-3.5z"/>
  </svg>
);

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] grid lg:grid-cols-2" data-testid="register-page">
      <div className="hidden lg:flex relative items-center justify-center overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${SCALES})` }} />
        <div className="absolute inset-0 bg-[#0A0A0A]/60 gold-glow" />
        <div className="relative px-12 max-w-md">
          <h2 className="font-serif text-5xl font-light text-[#FFFFF0] leading-tight">
            Join India's premier <span className="gold-text italic">legal AI</span> workspace.
          </h2>
          <p className="text-zinc-400 mt-6">Free to start. Built for lawyers, judges, students and firms.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 sm:px-8 py-16">
        <div className="w-full max-w-sm">
          <Logo size="sm" />
          <h1 className="font-serif text-4xl text-[#FFFFF0] mt-10">Create account</h1>
          <p className="text-zinc-500 mt-2">Begin your free membership.</p>

          {error && <div className="mt-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3" data-testid="register-error">{error}</div>}

          <form onSubmit={submit} className="space-y-4 mt-8">
            <input value={name} onChange={(e) => setName(e.target.value)} required data-testid="register-name" placeholder="Full name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0]" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="register-email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0]" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} data-testid="register-password" placeholder="Password (min 6 chars)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#D4AF37]/40 text-[#FFFFF0]" />
            <button type="submit" disabled={loading} data-testid="register-submit-btn" className="w-full rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] disabled:opacity-50 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Account
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button onClick={googleLogin} data-testid="google-register-btn" className="w-full rounded-full bg-white/5 border border-white/15 text-[#FFFFF0] hover:bg-white/10 px-6 py-3.5 text-sm font-semibold transition-all flex items-center justify-center gap-3">
            <GoogleIcon /> Continue with Google
          </button>

          <p className="text-center text-sm text-zinc-500 mt-8">
            Already a member? <Link to="/login" className="text-[#D4AF37] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
