import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { api, getUser } from "@/lib/api";

const G = "var(--primary)";
const BORDER = "var(--primary-border)";

/* ── stat card ─────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, highlight }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div style={{
      background: highlight ? "rgba(0,255,0,0.05)" : "rgba(0,0,0,0.55)",
      border: `1px solid ${highlight ? "rgba(0,255,0,0.35)" : BORDER}`,
      borderRadius: 12, padding: "18px 16px 14px", position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: ".6rem", color: "var(--gray-500)", letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>{label}</span>
        <span style={{ color: highlight ? G : "rgba(0,255,0,0.3)", flexShrink: 0 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: "1.6rem", color: highlight ? G : "#fff", lineHeight: 1, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: ".65rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace" }}>{sub}</div>}
    </div>
  );
}

/* ── action card ─────────────────────────────────────────── */
function ActionCard({ icon, title, desc, btnLabel, btnClass = "btn-solid", onClick }: {
  icon: React.ReactNode; title: string; desc: string;
  btnLabel: string; btnClass?: string; onClick: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`, borderRadius: 13, padding: "18px 20px", marginBottom: 10 }}>
      <div style={{ width: 46, height: 46, borderRadius: 11, background: "rgba(0,255,0,0.07)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: G }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".85rem", color: "#fff", marginBottom: 5 }}>{title}</div>
        <div style={{ fontSize: ".72rem", color: "var(--gray-400)", lineHeight: 1.55 }}>{desc}</div>
      </div>
      <button className={btnClass} style={{ flexShrink: 0, fontSize: ".72rem", padding: "10px 18px", whiteSpace: "nowrap" }} onClick={onClick}>
        {btnLabel} →
      </button>
    </div>
  );
}

/* ── quick tile ─────────────────────────────────────────── */
function QATile({ icon, label, sub, onClick }: { icon: React.ReactNode; label: string; sub?: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 14px", cursor: "pointer", transition: "all .15s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,0,0.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(0,255,0,0.04)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.55)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(0,255,0,0.07)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: G }}>{icon}</div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,0,0.3)" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
      </div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".75rem", color: "#fff", marginBottom: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: ".63rem", color: "var(--gray-600)" }}>{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [, nav] = useLocation();
  const user = getUser();
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
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "1.75rem", color: G, marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Command Center
        </h1>
        <p style={{ fontSize: ".78rem", color: "var(--gray-400)", fontFamily: "'JetBrains Mono',monospace" }}>
          Welcome back, <span style={{ color: G }}>@{user?.username}</span>
        </p>
      </div>

      {/* Stats row — 6 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Contacts" value={count}
          sub={count === 0 ? "none yet" : `from your card`}
          highlight={count > 0}
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard label="Slots Remaining" value={remaining}
          sub={`of ${maxContacts} max`}
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
        />
        <StatCard label="Progress" value={`${Math.round(pct)}%`}
          sub={stats?.targetReached ? "✓ target reached!" : "toward target"}
          highlight={stats?.targetReached}
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}
        />
        <StatCard label="Target" value={target}
          sub="contacts to unlock VCF"
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
        <StatCard label="Plan" value={planName.toUpperCase()}
          sub={`${maxContacts} contact limit`}
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
        <StatCard label="Card Status" value={cardSetUp ? "ACTIVE" : "SETUP"}
          sub={cardSetUp ? "card customised" : "needs setup"}
          highlight={cardSetUp}
          icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>}
        />
      </div>

      {/* Progress bar */}
      <div style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: ".7rem", color: "var(--gray-400)", fontFamily: "'JetBrains Mono',monospace" }}>
            {count} collected · {remaining} slots left · {target} target
          </span>
          {stats?.targetReached
            ? <span style={{ fontFamily: "'Orbitron',monospace", fontSize: ".72rem", color: G, fontWeight: 700 }}>✓ VCF READY</span>
            : <span style={{ fontSize: ".7rem", color: "var(--gray-600)" }}>🔒 unlocks at {target}</span>
          }
        </div>
        <div className="progress-track" style={{ height: 8 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Action cards */}
      {!cardSetUp && (
        <ActionCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>}
          title="Set Up Your Card"
          desc="Add a display name, bio, and social links so your public card looks professional."
          btnLabel="Customise Card"
          onClick={() => nav("/dashboard/settings")}
        />
      )}

      {count === 0 ? (
        <ActionCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
          title="Share Your Card Link"
          desc={`Your public card is live — share it to start collecting contacts. Card: /u/${user?.username}`}
          btnLabel="Copy Link"
          btnClass="btn-primary"
          onClick={() => navigator.clipboard.writeText(`${location.origin}/u/${user?.username}`)}
        />
      ) : (
        <ActionCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
          title={stats?.targetReached ? "Download Your VCF File" : `You have ${count} contact${count !== 1 ? "s" : ""} — keep collecting`}
          desc={stats?.targetReached ? "Target reached! Download all your contacts as a VCF file now." : `${remaining} more slots available. Share your link to collect more.`}
          btnLabel={stats?.targetReached ? "Download VCF" : "View Contacts"}
          onClick={stats?.targetReached ? downloadVcf : () => nav("/dashboard/contacts")}
        />
      )}

      {planName.toLowerCase() === "free" && (
        <ActionCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          title="Upgrade Your Plan"
          desc={`Free plan: ${maxContacts} contacts max. Upgrade to Pro for more contacts and advanced features.`}
          btnLabel="See Plans"
          btnClass="btn-ghost"
          onClick={() => nav("/dashboard/plans")}
        />
      )}

      {/* Quick Actions */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span style={{ fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: ".9rem", color: G }}>Quick Actions</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          <QATile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} label="Manage Contacts" sub={`${count} collected so far`} onClick={() => nav("/dashboard/contacts")} />
          <QATile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>} label="Card Settings" sub="Edit name, bio & links" onClick={() => nav("/dashboard/settings")} />
          <QATile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>} label="Download VCF" sub="Export all contacts" onClick={downloadVcf} />
          <QATile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>} label="Copy Card Link" sub={`/u/${user?.username}`} onClick={() => navigator.clipboard.writeText(`${location.origin}/u/${user?.username}`)} />
          <QATile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>} label="View Plans" sub="Upgrade for more contacts" onClick={() => nav("/dashboard/plans")} />
          <QATile icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>} label="View Public Card" sub="Preview as visitor" onClick={() => window.open(`/u/${user?.username}`, "_blank")} />
        </div>
      </div>

    </DashboardLayout>
  );
}
