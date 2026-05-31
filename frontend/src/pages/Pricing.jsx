import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

const ORDER = ["free", "student", "advocate", "lawfirm"];

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Pricing() {
  const [plans, setPlans] = useState({});
  const [busy, setBusy] = useState(null);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/plans").then(({ data }) => setPlans(data.plans)).catch(() => {});
  }, []);

  const subscribe = async (planKey) => {
    if (planKey === "free") {
      navigate(user ? "/dashboard" : "/register");
      return;
    }
    if (!user) {
      toast.error("Sign in to subscribe.");
      navigate("/login");
      return;
    }
    setBusy(planKey);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment gateway.");
      const { data } = await api.post("/payments/create-order", { plan: planKey });
      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "JusticeVerse",
        description: `${data.plan_name} Plan — Monthly`,
        order_id: data.order_id,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#D4AF37" },
        handler: async (resp) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              plan: planKey,
            });
            await refreshUser();
            toast.success(`Subscribed to ${data.plan_name}!`);
            navigate("/dashboard");
          } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Verification failed.");
          }
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rzp.open();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16" data-testid="pricing-page">
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D4AF37]">Membership</span>
        <h1 className="font-serif text-4xl sm:text-6xl font-light text-[#FFFFF0] mt-4">Choose your chamber</h1>
        <p className="text-zinc-400 mt-5">Transparent pricing for students, advocates and firms. Cancel anytime.</p>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 mt-16">
        {ORDER.filter((k) => plans[k]).map((key) => {
          const p = plans[key];
          const featured = key === "advocate";
          const current = user?.plan === key;
          return (
            <div
              key={key}
              data-testid={`plan-card-${key}`}
              className={`glass-card rounded-3xl p-8 flex flex-col relative ${featured ? "border-[#D4AF37]/50 shadow-[0_0_40px_rgba(212,175,55,0.12)]" : ""}`}
            >
              {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] bg-[#D4AF37] text-black px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-serif text-3xl text-[#FFFFF0]">{p.name}</h3>
              <p className="text-sm text-zinc-500 mt-2 min-h-[40px]">{p.tagline}</p>
              <div className="mt-6 flex items-end gap-1">
                <span className="font-serif text-5xl text-[#FFFFF0]">
                  {p.amount === 0 ? "₹0" : `₹${(p.amount / 100).toLocaleString("en-IN")}`}
                </span>
                {p.amount > 0 && <span className="text-zinc-500 text-sm mb-2">/ month</span>}
              </div>
              <ul className="space-y-3 mt-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(key)}
                disabled={busy === key || current}
                data-testid={`subscribe-btn-${key}`}
                className={`mt-8 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  featured ? "bg-[#FFFFF0] text-black hover:bg-[#E5E5D8]" : "bg-white/5 border border-white/15 text-[#FFFFF0] hover:bg-white/10"
                } disabled:opacity-50`}
              >
                {busy === key && <Loader2 className="w-4 h-4 animate-spin" />}
                {current ? "Current Plan" : key === "free" ? "Get Started" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-center font-mono text-xs text-zinc-600 mt-10">
        Payments secured by Razorpay · Test mode
      </p>
    </div>
  );
}
