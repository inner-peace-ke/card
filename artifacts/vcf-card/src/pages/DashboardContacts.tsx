import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { api, getUser } from "@/lib/api";
import { useIsMobile } from "@/hooks/useIsMobile";

const G = "var(--primary)";
const BORDER = "var(--primary-border)";

export default function DashboardContacts() {
  const [, nav] = useLocation();
  const user = getUser();
  const isMobile = useIsMobile();
  const [contacts, setContacts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        api.get("/dashboard/contacts"),
        api.get("/dashboard/stats"),
      ]);
      setContacts(c.contacts ?? []);
      setStats(s);
    } catch { nav("/login"); }
    finally { setLoading(false); }
  }, [nav]);

  useEffect(() => { load(); }, [load]);

  async function deleteContact(id: number) {
    setDeleting(id);
    try {
      await api.delete(`/dashboard/contacts/${id}`);
      setContacts(prev => prev.filter(c => c.id !== id));
      setStats((s: any) => s ? { ...s, count: Math.max(0, s.count - 1) } : s);
    } catch {}
    setDeleting(null);
  }

  async function clearAll() {
    try {
      await api.delete("/dashboard/contacts");
      setContacts([]); setConfirmClear(false);
      setStats((s: any) => s ? { ...s, count: 0, percentage: 0, targetReached: false } : s);
      setMsg({ ok: true, text: "All contacts cleared" });
      setTimeout(() => setMsg(null), 3000);
    } catch (e: any) { setMsg({ ok: false, text: e.message }); }
  }

  async function downloadVcf() {
    const res = await fetch("/api/dashboard/download", {
      headers: { Authorization: `Bearer ${localStorage.getItem("wolf_token")}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${user?.username}-contacts.vcf`; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = contacts.filter(c =>
    search === "" ||
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const count       = stats?.count ?? 0;
  const maxContacts = stats?.maxContacts ?? 200;
  const remaining   = Math.max(0, maxContacts - count);
  const pct         = Math.min(stats?.percentage ?? 0, 100);

  return (
    <DashboardLayout planName={stats?.planName}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: isMobile ? "1.2rem" : "1.5rem", color: G, marginBottom: 4 }}>
              Contacts
            </h1>
            <p style={{ fontSize: ".72rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.4 }}>
              {count} collected · {remaining} slots left · {maxContacts} max
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="btn-ghost" style={{ fontSize: ".72rem" }} onClick={load}>↻</button>
            <button className="btn-primary" style={{ fontSize: ".72rem" }} onClick={downloadVcf}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              VCF
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: ".65rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace" }}>{count} / {stats?.target ?? 200} target</span>
          {stats?.targetReached
            ? <span style={{ fontSize: ".65rem", color: G, fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>✓ VCF READY</span>
            : <span style={{ fontSize: ".65rem", color: "var(--gray-600)" }}>{remaining} slots left</span>
          }
        </div>
        <div className="progress-track" style={{ height: 6 }}><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      {/* Feedback */}
      {msg && (
        <div style={{ marginBottom: 12, padding: "9px 14px", borderRadius: 8, fontSize: ".72rem", display: "flex", gap: 8, alignItems: "center", color: msg.ok ? G : "var(--red)", background: msg.ok ? "rgba(0,255,0,0.05)" : "var(--red-bg)", border: `1px solid ${msg.ok ? "rgba(0,255,0,0.2)" : "var(--red-border)"}` }}>
          {msg.ok ? "✓" : "⚠"} {msg.text}
        </div>
      )}

      {/* Contacts card */}
      <div style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${BORDER}`, borderRadius: 13 }}>

        {/* Toolbar */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140, position: "relative" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,0,0.4)" strokeWidth="2" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              style={{ width: "100%", paddingLeft: 28, paddingRight: 8, paddingTop: 7, paddingBottom: 7, background: "rgba(0,0,0,0.6)", border: `1px solid ${BORDER}`, borderRadius: 7, color: "#fff", fontFamily: "'JetBrains Mono',monospace", fontSize: ".7rem", outline: "none", boxSizing: "border-box" }}
              placeholder="Search name or phone…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: ".65rem", color: "var(--gray-600)", whiteSpace: "nowrap" }}>{filtered.length} shown</div>
          {!confirmClear ? (
            <button className="btn-danger" style={{ fontSize: ".65rem", padding: "5px 10px", whiteSpace: "nowrap" }} onClick={() => setConfirmClear(true)}>
              Clear All
            </button>
          ) : (
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: ".65rem", color: "var(--red)" }}>Delete {count}?</span>
              <button className="btn-danger" style={{ fontSize: ".65rem", padding: "4px 9px" }} onClick={clearAll}>Yes</button>
              <button className="btn-ghost" style={{ fontSize: ".65rem", padding: "4px 9px" }} onClick={() => setConfirmClear(false)}>No</button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: G, fontFamily: "'Orbitron',monospace", fontSize: 11, letterSpacing: ".15em" }}>LOADING…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10, opacity: .3 }}>👥</div>
            <div style={{ fontSize: ".73rem", color: "var(--gray-600)", fontFamily: "'JetBrains Mono',monospace" }}>
              {search ? "No contacts match your search" : "No contacts yet. Share your card link to start collecting."}
            </div>
            {!search && (
              <button className="btn-primary" style={{ marginTop: 14, fontSize: ".72rem" }}
                onClick={() => navigator.clipboard.writeText(`${location.origin}/u/${user?.username}`)}>
                Copy Card Link
              </button>
            )}
          </div>
        ) : isMobile ? (
          /* Mobile: card list */
          <div style={{ maxHeight: 520, overflowY: "auto" }}>
            {filtered.map((c, i) => (
              <div key={c.id} style={{ padding: "12px 14px", borderBottom: `1px solid rgba(0,255,0,0.05)`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(0,255,0,0.06)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: ".6rem", color: "var(--gray-600)", fontFamily: "'JetBrains Mono',monospace" }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: ".78rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.fullName}</div>
                  <div style={{ fontSize: ".65rem", color: G, fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{c.phone}</div>
                  <div style={{ fontSize: ".6rem", color: "var(--gray-600)", marginTop: 1 }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <button
                  className="btn-danger" disabled={deleting === c.id}
                  style={{ padding: "4px 9px", fontSize: ".62rem", flexShrink: 0 }}
                  onClick={() => deleteContact(c.id)}
                >
                  {deleting === c.id ? "…" : "✕"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: table */
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 500 }}>
              <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 160px 120px 60px", gap: 0, padding: "9px 18px", borderBottom: `1px solid ${BORDER}` }}>
                {["#", "Name", "Phone", "Joined", ""].map((h, i) => (
                  <div key={i} style={{ fontSize: ".58rem", color: "var(--gray-600)", letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>{h}</div>
                ))}
              </div>
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {filtered.map((c, i) => (
                  <div key={c.id}
                    style={{ display: "grid", gridTemplateColumns: "30px 1fr 160px 120px 60px", gap: 0, padding: "11px 18px", borderBottom: `1px solid rgba(0,255,0,0.05)`, alignItems: "center", transition: "background .1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,0,0.02)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ fontSize: ".63rem", color: "var(--gray-700)" }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: ".76rem", color: "#fff", fontWeight: 600, marginBottom: 1 }}>{c.fullName}</div>
                      {c.email && <div style={{ fontSize: ".6rem", color: "var(--gray-600)" }}>{c.email}</div>}
                    </div>
                    <div style={{ fontSize: ".7rem", color: G, fontFamily: "'JetBrains Mono',monospace" }}>{c.phone}</div>
                    <div style={{ fontSize: ".63rem", color: "var(--gray-600)" }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                    <div style={{ textAlign: "right" }}>
                      <button className="btn-danger" disabled={deleting === c.id}
                        style={{ padding: "3px 8px", fontSize: ".6rem" }}
                        onClick={() => deleteContact(c.id)}>
                        {deleting === c.id ? "…" : "✕"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
