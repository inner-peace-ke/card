import { useState, useEffect, useCallback } from "react";
import NeonBg from "@/components/NeonBg";
import WolfNav from "@/components/WolfNav";
import { api } from "@/lib/api";

const iStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "rgba(0,0,0,0.6)", border: "1px solid var(--primary-border)",
  borderRadius: 8, color: "#fff", fontFamily: "'JetBrains Mono',monospace",
  fontSize: 12, outline: "none",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="wolf-card" style={{ marginBottom: 12 }}>
      <div className="wolf-card-top" />
      <div style={{ padding: "18px 20px" }}>
        <div className="wolf-label" style={{ marginBottom: 14 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

function Msg({ text }: { text: string }) {
  if (!text) return null;
  const ok = text.startsWith("✓");
  return (
    <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 7, fontSize: 11, display: "flex", gap: 7, alignItems: "center", color: ok ? "var(--primary)" : "var(--red)", background: ok ? "rgba(0,255,0,0.05)" : "var(--red-bg)", border: `1px solid ${ok ? "rgba(0,255,0,0.2)" : "var(--red-border)"}` }}>
      {ok
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {text.replace(/^✓ /, "")}
    </div>
  );
}

export default function SuperAdmin() {
  const [authed, setAuthed] = useState(false);
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [superToken, setSuperToken] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [paystack, setPaystack] = useState({ publicKey: "", secretKey: "", testMode: true });
  const [paystackMsg, setPaystackMsg] = useState("");
  const [planMsg, setPlanMsg] = useState("");
  const [editPlan, setEditPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({ name: "", maxContacts: 200, priceKes: 0, features: "" });

  const load = useCallback(async (tok: string) => {
    try {
      const [s, u, p, ps] = await Promise.all([
        api.superGet("/super/stats", tok),
        api.superGet("/super/users", tok),
        api.superGet("/super/plans", tok),
        api.superGet("/super/paystack", tok),
      ]);
      setStats(s); setUsers(u.users ?? []); setPlans(p.plans ?? []);
      setPaystack({ publicKey: ps.publicKey, secretKey: ps.secretKey === "***set***" ? "***set***" : "", testMode: ps.testMode === "true" });
    } catch {}
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoginErr(""); setLoginLoading(true);
    const tok = btoa(`${creds.email}:${creds.password}`);
    try {
      await api.superPost("/super/login", {}, tok);
      setSuperToken(tok); setAuthed(true); load(tok);
    } catch (e: any) { setLoginErr(e.message); }
    finally { setLoginLoading(false); }
  }

  async function savePaystack(e: React.FormEvent) {
    e.preventDefault(); setPaystackMsg("");
    try {
      await api.superPut("/super/paystack", {
        publicKey: paystack.publicKey,
        secretKey: paystack.secretKey !== "***set***" ? paystack.secretKey : undefined,
        testMode: String(paystack.testMode),
      }, superToken);
      setPaystackMsg("✓ Paystack keys saved");
    } catch (e: any) { setPaystackMsg(e.message); }
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault(); setPlanMsg("");
    try {
      if (editPlan) {
        await api.superPut(`/super/plans/${editPlan.id}`, {
          name: editPlan.name, maxContacts: Number(editPlan.maxContacts),
          priceKes: Number(editPlan.priceKes), features: JSON.parse(editPlan.features || "[]"), isActive: editPlan.isActive,
        }, superToken);
        setPlanMsg("✓ Plan updated"); setEditPlan(null);
      } else {
        await api.superPost("/super/plans", {
          name: newPlan.name, maxContacts: Number(newPlan.maxContacts), priceKes: Number(newPlan.priceKes),
          features: newPlan.features.split(",").map((s: string) => s.trim()).filter(Boolean),
        }, superToken);
        setPlanMsg("✓ Plan created"); setNewPlan({ name: "", maxContacts: 200, priceKes: 0, features: "" });
      }
      const p = await api.superGet("/super/plans", superToken);
      setPlans(p.plans ?? []);
    } catch (e: any) { setPlanMsg(e.message); }
  }

  async function assignPlan(userId: number, planId: number) {
    await api.superPut(`/super/users/${userId}/plan`, { planId }, superToken).catch(() => {});
    const u = await api.superGet("/super/users", superToken);
    setUsers(u.users ?? []);
  }

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
      <NeonBg />
      <WolfNav sub="Super Admin" />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 40px", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 360 }} className="fade-in-up">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="wolf-badge" style={{ margin: "0 auto 16px" }}>
              <div className="wolf-badge-dot" />
              Credentials set via server .env
            </div>
            <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "1.6rem" }}>
              <span style={{ color: "#fff" }}>SUPER </span>
              <span style={{ color: "var(--primary)" }}>ADMIN</span>
            </h1>
          </div>
          <div className="wolf-card">
            <div className="wolf-card-top" />
            <div style={{ padding: "26px 22px" }}>
              <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="wolf-label">Admin Email</label>
                  <input style={iStyle} type="email" placeholder="admin@wolf.tech" value={creds.email}
                    onChange={e => setCreds(c => ({ ...c, email: e.target.value }))} required autoFocus autoComplete="email" />
                </div>
                <div>
                  <label className="wolf-label">Admin Password</label>
                  <input style={iStyle} type="password" placeholder="••••••••" value={creds.password}
                    onChange={e => setCreds(c => ({ ...c, password: e.target.value }))} required autoComplete="current-password" />
                </div>
                {loginErr && (
                  <div style={{ padding: "9px 13px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, fontSize: 11, color: "var(--red)", display: "flex", gap: 6, alignItems: "center" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {loginErr}
                  </div>
                )}
                <button className="btn-solid" type="submit" disabled={loginLoading} style={{ marginTop: 4 }}>
                  {loginLoading
                    ? <><span className="spin" style={{ display: "inline-block", width: 13, height: 13, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%" }} /> Authenticating…</>
                    : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> LOGIN</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
      <NeonBg />
      <WolfNav
        sub="Super Admin Panel"
        right={<button className="btn-ghost" style={{ fontSize: 10 }} onClick={() => setAuthed(false)}>Logout</button>}
      />
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "84px 14px 60px", position: "relative", zIndex: 10 }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {[{ label: "Total Users", v: stats.users }, { label: "Total Contacts", v: stats.contacts }].map(s => (
              <div key={s.label} className="wolf-card" style={{ padding: "18px 14px", textAlign: "center" }}>
                <div className="stat-value" style={{ fontSize: "2.2rem" }}>{s.v}</div>
                <div className="wolf-label" style={{ marginTop: 5, marginBottom: 0 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Plans */}
        <Card title="Plans">
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
            {plans.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "rgba(0,255,0,0.02)", border: "1px solid var(--primary-border)", borderRadius: 9 }}>
                <div>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 10, color: "var(--gray-500)", marginLeft: 10 }}>{p.maxContacts} contacts · KES {p.priceKes}</span>
                  {!p.isActive && <span style={{ marginLeft: 8, fontSize: 9, color: "var(--red)" }}>INACTIVE</span>}
                </div>
                <button className="btn-primary" style={{ fontSize: 9, padding: "4px 10px" }}
                  onClick={() => setEditPlan({ ...p, features: JSON.stringify(JSON.parse(p.features || "[]")) })}>
                  Edit
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={savePlan} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div className="wolf-label" style={{ marginBottom: 0, color: "var(--primary)" }}>
              {editPlan ? "✏ Edit Plan" : "+ New Plan"}
            </div>
            {editPlan ? (
              <>
                <input style={iStyle} placeholder="Plan name" value={editPlan.name} onChange={e => setEditPlan((p: any) => ({ ...p, name: e.target.value }))} required />
                <input style={iStyle} type="number" placeholder="Max contacts" value={editPlan.maxContacts} onChange={e => setEditPlan((p: any) => ({ ...p, maxContacts: e.target.value }))} />
                <input style={iStyle} type="number" placeholder="Price (KES)" value={editPlan.priceKes} onChange={e => setEditPlan((p: any) => ({ ...p, priceKes: e.target.value }))} />
                <input style={iStyle} placeholder='Features JSON e.g. ["Feature 1","Feature 2"]' value={editPlan.features} onChange={e => setEditPlan((p: any) => ({ ...p, features: e.target.value }))} />
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--gray-400)", cursor: "pointer" }}>
                  <input type="checkbox" checked={editPlan.isActive} onChange={e => setEditPlan((p: any) => ({ ...p, isActive: e.target.checked }))} />
                  Active plan
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-solid" type="submit">Save Plan</button>
                  <button className="btn-ghost" type="button" onClick={() => setEditPlan(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <input style={iStyle} placeholder="Plan name (e.g. Pro)" value={newPlan.name} onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))} required />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input style={iStyle} type="number" placeholder="Max contacts" value={newPlan.maxContacts} onChange={e => setNewPlan(p => ({ ...p, maxContacts: Number(e.target.value) }))} />
                  <input style={iStyle} type="number" placeholder="Price (KES)" value={newPlan.priceKes} onChange={e => setNewPlan(p => ({ ...p, priceKes: Number(e.target.value) }))} />
                </div>
                <input style={iStyle} placeholder="Features (comma-separated)" value={newPlan.features} onChange={e => setNewPlan(p => ({ ...p, features: e.target.value }))} />
                <button className="btn-primary" type="submit">+ Create Plan</button>
              </>
            )}
            <Msg text={planMsg} />
          </form>
        </Card>

        {/* Paystack */}
        <Card title="Paystack Configuration">
          <form onSubmit={savePaystack} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label className="wolf-label">Public Key</label>
              <input style={iStyle} placeholder="pk_test_…" value={paystack.publicKey} onChange={e => setPaystack(p => ({ ...p, publicKey: e.target.value }))} />
            </div>
            <div>
              <label className="wolf-label">Secret Key</label>
              <input style={iStyle} type="password" placeholder={paystack.secretKey === "***set***" ? "Key set — enter new to change" : "sk_test_…"} value={paystack.secretKey === "***set***" ? "" : paystack.secretKey} onChange={e => setPaystack(p => ({ ...p, secretKey: e.target.value }))} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--gray-400)", cursor: "pointer" }}>
              <input type="checkbox" checked={paystack.testMode} onChange={e => setPaystack(p => ({ ...p, testMode: e.target.checked }))} />
              Test mode (use test keys)
            </label>
            <button className="btn-primary" type="submit">Save Paystack Keys</button>
            <Msg text={paystackMsg} />
          </form>
        </Card>

        {/* Users */}
        <Card title={`Users (${users.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 440, overflowY: "auto" }}>
            {users.length === 0
              ? <div style={{ textAlign: "center", padding: "24px 0", fontSize: 11, color: "var(--gray-600)" }}>No users yet.</div>
              : users.map(u => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", background: "rgba(0,255,0,0.02)", border: "1px solid var(--primary-border)", borderRadius: 9 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>@{u.username}</div>
                    <div style={{ fontSize: 10, color: "var(--gray-500)" }}>{u.email}</div>
                    <div style={{ fontSize: 9, color: "var(--gray-600)" }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                  </div>
                  <select value={u.planId} onChange={e => assignPlan(u.id, Number(e.target.value))}
                    style={{ background: "rgba(0,0,0,0.8)", border: "1px solid var(--primary-border)", color: "var(--primary)", borderRadius: 7, padding: "5px 8px", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", cursor: "pointer", outline: "none" }}>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              ))
            }
          </div>
        </Card>
      </div>
    </div>
  );
}
