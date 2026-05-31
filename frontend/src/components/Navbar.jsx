import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { to: "/justicebot", label: "JusticeBot AI" },
  { to: "/database", label: "Legal Database" },
  { to: "/knowledge-hub", label: "Knowledge Hub" },
  { to: "/careers", label: "Careers" },
  { to: "/pricing", label: "Pricing" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <Link to="/" data-testid="nav-home-link">
          <Logo size="sm" />
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.to.replace("/", "")}`}
              className={`font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                location.pathname === l.to ? "text-[#D4AF37]" : "text-zinc-400 hover:text-[#FFFFF0]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  data-testid="nav-admin-link"
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#D4AF37] hover:opacity-80"
                >
                  <Shield className="w-4 h-4" /> Owner
                </Link>
              )}
              <Link
                to="/dashboard"
                data-testid="nav-dashboard-link"
                className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-zinc-300 hover:text-[#FFFFF0]"
              >
                <LayoutDashboard className="w-4 h-4" /> {user.name?.split(" ")[0] || "Account"}
              </Link>
              <button
                onClick={handleLogout}
                data-testid="nav-logout-btn"
                className="rounded-full bg-white/5 border border-white/10 text-[#FFFFF0] hover:bg-white/10 px-5 py-2 text-xs font-semibold transition-all"
              >
                <LogOut className="w-3.5 h-3.5 inline mr-1" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login-link"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-300 hover:text-[#FFFFF0]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                data-testid="nav-register-link"
                className="rounded-full bg-[#FFFFF0] text-black hover:bg-[#E5E5D8] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-[#FFFFF0]"
          onClick={() => setOpen(!open)}
          data-testid="nav-mobile-toggle"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-[#0A0A0A] px-5 py-6 space-y-5" data-testid="mobile-menu">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              data-testid={`mobile-link-${l.to.replace("/", "")}`}
              className="block font-mono text-sm uppercase tracking-[0.18em] text-zinc-300"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/5 space-y-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="block font-mono text-sm uppercase tracking-[0.15em] text-[#D4AF37]">
                    Owner Dashboard
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block font-mono text-sm uppercase tracking-[0.15em] text-zinc-300">
                  My Workspace
                </Link>
                <button onClick={handleLogout} className="font-mono text-sm uppercase tracking-[0.15em] text-zinc-400">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block font-mono text-sm uppercase tracking-[0.18em] text-zinc-300">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-full bg-[#FFFFF0] text-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
