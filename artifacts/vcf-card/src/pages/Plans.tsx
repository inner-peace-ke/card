import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";

const G = "var(--primary)";
const BORDER = "var(--primary-border)";

const PLANS = [
  {
    id: "free",
    name: "FREE",
    price: "KES 0",
    period: "forever",
    contacts: 200,
    features: [
      "1 public card at /u/username",
      "Up to 200 contacts",
      "Phone + name collection",
      "VCF download on target",
      "4 social link slots",
      "Progress bar on card",
    ],
    cta: "Current Plan",
    current: true,
    highlight: false,
  },
  {
    id: "pro",
    name: "PRO",
    price: "KES 500",
    period: "/ month",
    contacts: 2000,
    features: [
      "Everything in Free",
      "Up to 2,000 contacts",
      "Custom contact target",
      "CSV + VCF export",
      "Remove WolfVCF branding",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    current: false,
    highlight: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    price: "KES 2,000",
    period: "/ month",
    contacts: 10000,
    features: [
      "Everything in Pro",
      "Up to 10,000 contacts",
      "Multiple cards",
      "Team access",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    current: false,
    highlight: false,
  },
];

export default function Plans() {
  const [, nav] = useLocation();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/dashboard/stats").then(setStats).catch(() => nav("/login"));
  }, [nav]);

  const currentPlan = (stats?.planName ?? "Free").toLowerCase();

  return (
    <DashboardLayout planName={stats?.planName}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "1.5rem", color: G, marginBottom: 4 }}>Plans</h1>
        <p style={{ fontSize: ".75rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace" }}>
          You are on the <span style={{ color: G }}>{stats?.planName ?? "Free"}</span> plan — {stats?.maxContacts ?? 200} contact limit
        </p>
      </div>

      {/* Current usage banner */}
      {stats && (
        <div style={{ background: "rgba(0,255,0,0.04)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 18px", marginBottom: 28, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: ".62rem", color: "var(--gray-600)", letterSpacing: ".08em", marginBottom: 4, textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>Current Usage</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "1.1rem", color: G }}>
              {stats.count} <span style={{ fontSize: ".75rem", color: "var(--gray-400)" }}>/ {stats.maxContacts} contacts</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="progress-track" style={{ height: 7 }}>
              <div className="progress-fill" style={{ width: `${Math.min((stats.count / stats.maxContacts) * 100, 100)}%` }} />
            </div>
          </div>
          <div style={{ fontSize: ".7rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace" }}>
            {Math.max(0, stats.maxContacts - stats.count)} slots left
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }}>
        {PLANS.map(plan => {
          const isCurrent = plan.name.toLowerCase() === currentPlan;
          return (
            <div
              key={plan.id}
              style={{
                background: plan.highlight ? "rgba(0,255,0,0.04)" : "rgba(0,0,0,0.55)",
                border: `1px solid ${plan.highlight ? "rgba(0,255,0,0.4)" : BORDER}`,
                borderRadius: 14, padding: "24px 20px",
                position: "relative", overflow: "hidden",
              }}
            >
              {plan.highlight && (
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(0,255,0,0.8), transparent)" }} />
              )}
              {isCurrent && (
                <div style={{ position: "absolute", top: 14, right: 14, fontSize: ".58rem", background: G, color: "#000", padding: "3px 7px", borderRadius: 4, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>
                  CURRENT
                </div>
              )}
              {plan.highlight && !isCurrent && (
                <div style={{ position: "absolute", top: 14, right: 14, fontSize: ".58rem", background: "rgba(0,255,0,0.15)", color: G, border: `1px solid rgba(0,255,0,0.3)`, padding: "3px 7px", borderRadius: 4, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>
                  POPULAR
                </div>
              )}

              <div style={{ marginBottom: 6 }}>
                <span style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: ".82rem", color: plan.highlight ? G : "#fff", letterSpacing: ".08em" }}>{plan.name}</span>
              </div>
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "1.8rem", color: plan.highlight ? G : "#fff" }}>{plan.price}</span>
                <span style={{ fontSize: ".72rem", color: "var(--gray-500)", marginLeft: 4 }}>{plan.period}</span>
              </div>

              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".7rem", color: "var(--gray-400)", marginBottom: 18 }}>
                Up to <span style={{ color: plan.highlight ? G : "#fff", fontWeight: 700 }}>{plan.contacts.toLocaleString()}</span> contacts
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: ".7rem", color: "var(--gray-400)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? "#00ff00" : "rgba(0,255,0,0.5)"} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>

              <button
                className={isCurrent ? "btn-ghost" : plan.highlight ? "btn-solid" : "btn-primary"}
                disabled={isCurrent}
                style={{ width: "100%", opacity: isCurrent ? 0.5 : 1, cursor: isCurrent ? "not-allowed" : "pointer" }}
                onClick={() => {
                  if (!isCurrent) alert("Payment integration coming soon. Contact admin to upgrade.");
                }}
              >
                {isCurrent ? "✓ Active Plan" : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${BORDER}`, borderRadius: 13, padding: "22px 24px" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".88rem", color: G, marginBottom: 18 }}>FAQ</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {[
            { q: "What happens when I hit the contact limit?", a: "Your card will stop accepting new contacts. Existing contacts are safe. Upgrade to get more slots." },
            { q: "Can I download my contacts anytime?", a: "Yes — the VCF download is available from your dashboard at any time, regardless of whether you've hit your target." },
            { q: "How do I upgrade?", a: "Payments are being integrated. For now, contact the admin to manually upgrade your account." },
            { q: "What is the contact target?", a: "You set a target (e.g. 100). Your public card shows a progress bar. The VCF download unlocks for visitors once reached." },
          ].map(item => (
            <div key={item.q}>
              <div style={{ fontSize: ".75rem", color: "#fff", fontWeight: 600, marginBottom: 5 }}>{item.q}</div>
              <div style={{ fontSize: ".7rem", color: "var(--gray-500)", lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}
