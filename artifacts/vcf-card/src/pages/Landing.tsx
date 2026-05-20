import { useLocation } from "wouter";
import NeonBg from "@/components/NeonBg";
import WolfNav from "@/components/WolfNav";
import { getUser } from "@/lib/api";

const features = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
        <line x1="20" y1="14" x2="20" y2="20"/><line x1="17" y1="20" x2="20" y2="20"/>
      </svg>
    ),
    title: "YOUR CARD",
    desc: "Get a shareable public link at /u/yourname. Share it anywhere — WhatsApp, IG, anywhere.",
    cta: "Create Free Card",
    href: "/signup",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "CROWD COLLECT",
    desc: "Visitors submit their name + phone. Track progress toward your target — up to 200 contacts free.",
    cta: "See How It Works",
    href: "/signup",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    title: "GET YOUR VCF",
    desc: "Hit your target and instantly download a VCF file with all collected contacts, ready to import.",
    cta: "Get Started",
    href: "/signup",
  },
];

export default function Landing() {
  const [, nav] = useLocation();
  const user = getUser();

  return (
    <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
      <NeonBg />
      <WolfNav
        sub="Digital Card Platform"
        right={
          user ? (
            <button className="btn-primary" onClick={() => nav("/dashboard")}>Dashboard →</button>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => nav("/login")}>Login</button>
              <button className="btn-primary" onClick={() => nav("/signup")}>Sign Up Free</button>
            </>
          )
        }
      />

      {/* Hero */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "8rem 1.5rem 4rem", position: "relative", zIndex: 10 }}>

        <div className="wolf-badge fade-in-down" style={{ marginBottom: "1.75rem" }}>
          <div className="wolf-badge-dot" />
          Crowd-powered contact collection
        </div>

        <h1 style={{ fontFamily: "'Orbitron', monospace", fontWeight: 900, fontSize: "clamp(2.4rem,8vw,5rem)", lineHeight: 1.08, letterSpacing: "-.02em", marginBottom: "1.25rem" }} className="fade-in-up delay-1">
          <span style={{ color: "#fff" }}>COLLECT YOUR</span><br />
          <span style={{ background: "linear-gradient(135deg,rgba(0,255,0,.95),rgba(0,255,0,.55))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>CONTACTS.</span>
        </h1>

        <p style={{ fontSize: ".88rem", color: "var(--primary)", fontFamily: "'JetBrains Mono',monospace", marginBottom: ".5rem" }} className="fade-in-up delay-2">
          // Share your link. Watch contacts roll in. Download your VCF.
        </p>
        <p style={{ maxWidth: 460, fontSize: ".9rem", color: "var(--gray-400)", lineHeight: 1.75, margin: ".75rem auto 3rem" }} className="fade-in-up delay-3">
          Create a digital card in seconds. Share a single link with your audience.
          When your target is hit, download all contacts as a VCF file — ready to import anywhere.
        </p>

        {/* Action cards */}
        <div className="fade-in-up delay-5" style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {features.map(f => (
            <div
              key={f.title}
              className="wolf-card wolf-card-hover"
              style={{ width: 230, padding: "28px 22px", textAlign: "center", cursor: "pointer" }}
              onClick={() => nav(user ? "/dashboard" : f.href)}
            >
              <div className="wolf-icon-box" style={{ margin: "0 auto 18px" }}>{f.icon}</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".85rem", color: "#fff", marginBottom: 8, letterSpacing: ".05em" }}>{f.title}</div>
              <p style={{ fontSize: ".72rem", color: "var(--gray-400)", lineHeight: 1.65, marginBottom: 20 }}>{f.desc}</p>
              <span className="btn-primary" style={{ fontSize: ".68rem", padding: "8px 16px" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                {f.cta}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom trust strip */}
        <div style={{ marginTop: "3.5rem", display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }} className="fade-in-up delay-5">
          {["Free tier · 200 contacts", "No credit card needed", "Shareable /u/username link", "Upgrade anytime"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: ".7rem", color: "var(--gray-500)" }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--primary)", opacity: .6 }} />
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(0,255,0,0.1)", background: "rgba(0,0,0,0.5)", padding: "2rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: ".85rem", fontWeight: 700 }}>
          <span style={{ color: "var(--primary)" }}>WOLF</span>
          <span style={{ color: "var(--gray-500)" }}>VCF</span>
        </div>
        <div style={{ fontSize: ".68rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace", marginTop: 6 }}>
          © 2026 WOLFVCF. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
