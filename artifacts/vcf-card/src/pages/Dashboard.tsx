import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { api, getUser } from "@/lib/api";
import { useIsMobile } from "@/hooks/useIsMobile";

const G = "var(--primary)";
const BORDER = "var(--primary-border)";

function StatCard({ label, value, sub, icon, highlight }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div style={{
      background: highlight ? "rgba(0,255,0,0.05)" : "rgba(0,0,0,0.55)",
      border: `1px solid ${highlight ? "rgba(0,255,0,0.35)" : BORDER}`,
      borderRadius: 12, padding: "14px 13px 12px", position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: ".58rem", color: "var(--gray-500)", letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.3 }}>{label}</span>
        <span style={{ color: highlight ? G : "rgba(0,255,0,0.3)", flexShrink: 0, marginLeft: 4 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "1.35rem", color: highlight ? G : "#fff", lineHeight: 1, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: ".6rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.3 }}>{sub}</div>}
    </div>
  );
}

function ActionCard({ icon, title, desc, btnLabel, btnClass = "btn-solid", onClick, isMobile }: {
  icon: React.ReactNode; title: string; desc: string;
  btnLabel: string; btnClass?: string; onClick: () => void; isMobile?: boolean;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      gap: isMobile ? 12 : 18,
      background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`,
      borderRadius: 13, padding: "16px 18px", marginBottom: 10,
    }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(0,255,0,0.07)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: G }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".82rem", color: "#fff", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: ".7rem", color: "var(--gray-400)", lineHeight: 1.55 }}>{desc}</div>
      </div>
      <button className={btnClass} style={{ flexShrink: 0, fontSize: ".72rem", padding: "9px 16px", whiteSpace: "nowrap", alignSelf: isMobile ? "stretch" : "center", width: isMobile ? "100%" : "auto", textAlign: "center" }} onClick={onClick}>
        {btnLabel} →
      </button>
    </div>
  );
}

function QATile({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "15px 12px", cursor: "pointer", transition: "all .15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,0,0.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,255,0,0.04)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.55)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,255,0,0.07)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: G }}>{icon}</div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,0,0.3)" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
      </div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".7rem", color: "#fff", marginBottom: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: ".6rem", color: "var(--gray-600)", lineHeight: 1.3 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [, nav] = useLocation();
  const user = getUser();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, sets] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/settings"),
      ]);
      setStats(s); setSettings(sets.settings ?? {});
    } catch { nav("/login"); }
    finally { setLoading(false); }
  }, [nav]);

  useEffect(() => { load(); }, [load]);

  async function downloadVcf() {
    const res = await fetch("/api/dashboard/download", {
      headers: { Authorization: `Bearer ${localStorage.getItem("wolf_token")}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${user?.username}-contacts.vcf`; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: G, letterSpacing: ".2em" }}>LOADING…</div>
      </div>
    </DashboardLayout>
  );

  const count       = stats?.count ?? 0;
  const maxContacts = stats?.maxContacts ?? 200;
  const target      = stats?.target ?? 200;
  const pct         = Math.min(stats?.percentage ?? 0, 100);
  const remaining   = Math.max(0, maxContacts - count);
  const planName    = stats?.planName ?? "Free";
  const cardSetUp   = settings?.cardName && settings.cardName !== user?.username;

  return (
    <DashboardLayout planName={planName}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: isMobile ? "1.3rem" : "1.75rem", color: G, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Command Center
        </h1>
        <p style={{ fontSize: ".75rem", color: "var(--gray-400)", fontFamily: "'JetBrains Mono',monospace" }}>
          Welcome back, <span style={{ color: G }}>@{user?.username}</span>
        </p>
      </div>

      {/* Stats — 3 cols on mobile, 6 on desktop */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(6,1fr)", gap: 8, marginBottom: 16 }}>
        <StatCard label="Contacts" value={count}
          sub={count === 0 ? "none yet" : "collected"}
          highlight={count > 0}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard label="Slots Left" value={remaining}
          sub={`of ${maxContacts}`}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
        />
        <StatCard label="Progress" value={`${Math.round(pct)}%`}
          sub={stats?.targetReached ? "✓ reached!" : "to target"}
          highlight={stats?.targetReached}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
        />
        <StatCard label="Target" value={target}
          sub="to unlock VCF"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
        <StatCard label="Plan" value={planName.toUpperCase()}
          sub={`${maxContacts} limit`}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
        <StatCard label="Card" value={cardSetUp ? "ACTIVE" : "SETUP"}
          sub={cardSetUp ? "customised" : "needs setup"}
          highlight={cardSetUp}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>}
        />
      </div>

      {/* Progress bar */}
      <div style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "13px 16px", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: ".68rem", color: "var(--gray-400)", fontFamily: "'JetBrains Mono',monospace" }}>
            {count} collected · {remaining} left · target {target}
          </span>
          {stats?.targetReached
            ? <span style={{ fontFamily: "'Orbitron',monospace", fontSize: ".68rem", color: G, fontWeight: 700 }}>✓ VCF READY</span>
            : <span style={{ fontSize: ".68rem", color: "var(--gray-600)" }}>🔒 unlocks at {target}</span>
          }
        </div>
        <div className="progress-track" style={{ height: 7 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Action cards */}
      {!cardSetUp && (
        <ActionCard isMobile={isMobile}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>}
          title="Set Up Your Card"
          desc="Add a display name, bio, and social links so your public card looks professional."
          btnLabel="Customise Card"
          onClick={() => nav("/dashboard/settings")}
        />
      )}

      {count === 0 ? (
        <ActionCard isMobile={isMobile}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
          title="Share Your Card Link"
          desc={`Your public card is live — share it to start collecting contacts.`}
          btnLabel="Copy Link"
          btnClass="btn-primary"
          onClick={() => navigator.clipboard.writeText(`${location.origin}/u/${user?.username}`)}
        />
      ) : (
        <ActionCard isMobile={isMobile}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
          title={stats?.targetReached ? "Download Your VCF File" : `${count} contact${count !== 1 ? "s" : ""} collected — keep going`}
          desc={stats?.targetReached ? "Target reached! Download all your contacts as a VCF file now." : `${remaining} more slots available. Share your link to collect more.`}
          btnLabel={stats?.targetReached ? "Download VCF" : "View Contacts"}
          onClick={stats?.targetReached ? downloadVcf : () => nav("/dashboard/contacts")}
        />
      )}

      {planName.toLowerCase() === "free" && (
        <ActionCard isMobile={isMobile}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          title="Upgrade Your Plan"
          desc={`Free plan: ${maxContacts} contacts max. Upgrade to Pro for more contacts and features.`}
          btnLabel="See Plans"
          btnClass="btn-ghost"
          onClick={() => nav("/dashboard/plans")}
        />
      )}

      {/* Quick Actions */}
      <div style={{ marginTop: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".85rem", color: G }}>Quick Actions</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 8 }}>
          <QATile icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} label="Contacts" sub={`${count} collected`} onClick={() => nav("/dashboard/contacts")} />
          <QATile icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>} label="Card Settings" sub="Edit name & links" onClick={() => nav("/dashboard/settings")} />
          <QATile icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>} label="Download VCF" sub="Export contacts" onClick={downloadVcf} />
          <QATile icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>} label="Copy Card Link" sub={`/u/${user?.username}`} onClick={() => navigator.clipboard.writeText(`${location.origin}/u/${user?.username}`)} />
          <QATile icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} label="View Plans" sub="Upgrade for more" onClick={() => nav("/dashboard/plans")} />
          <QATile icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>} label="Public Card" sub="Preview as visitor" onClick={() => window.open(`/u/${user?.username}`, "_blank")} />
        </div>
      </div>

    </DashboardLayout>
  );
}
