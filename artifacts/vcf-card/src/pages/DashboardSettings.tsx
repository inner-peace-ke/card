import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";

const BORDER = "var(--primary-border)";
const G = "var(--primary)";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: ".6rem", color: "var(--gray-500)", letterSpacing: ".1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 13px",
  background: "rgba(0,0,0,0.7)", border: `1px solid ${BORDER}`,
  borderRadius: 8, color: "#fff", fontFamily: "'JetBrains Mono',monospace",
  fontSize: ".78rem", outline: "none",
};

function Msg({ text }: { text: string }) {
  if (!text) return null;
  const ok = text.startsWith("✓");
  return (
    <div style={{ padding: "9px 13px", borderRadius: 8, fontSize: ".72rem", display: "flex", gap: 7, alignItems: "center", color: ok ? G : "var(--red)", background: ok ? "rgba(0,255,0,0.05)" : "var(--red-bg)", border: `1px solid ${ok ? "rgba(0,255,0,0.2)" : "var(--red-border)"}` }}>
      {ok ? "✓" : "⚠"} {text.replace(/^[✓⚠] /, "")}
    </div>
  );
}

export default function DashboardSettings({ defaultTab = "card" }: { defaultTab?: "card" | "password" }) {
  const [, nav] = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [activeTab, setActiveTab] = useState<"card" | "password">(defaultTab);

  const load = useCallback(async () => {
    try {
      const [s, sets] = await Promise.all([api.get("/dashboard/stats"), api.get("/dashboard/settings")]);
      setStats(s); setSettings(sets.settings ?? {});
    } catch { nav("/login"); }
    finally { setLoading(false); }
  }, [nav]);

  useEffect(() => { load(); }, [load]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault(); setSettingsMsg("");
    try {
      await api.put("/dashboard/settings", settings);
      setSettingsMsg("✓ Card settings saved");
      setTimeout(() => setSettingsMsg(""), 4000);
    } catch (e: any) { setSettingsMsg(e.message); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setPwMsg("");
    if (pw.newPw !== pw.confirm) { setPwMsg("Passwords don't match"); return; }
    if (pw.newPw.length < 6) { setPwMsg("New password must be at least 6 characters"); return; }
    try {
      await api.put("/dashboard/password", { currentPassword: pw.current, newPassword: pw.newPw });
      setPwMsg("✓ Password updated");
      setPw({ current: "", newPw: "", confirm: "" });
      setTimeout(() => setPwMsg(""), 4000);
    } catch (e: any) { setPwMsg(e.message); }
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: G, letterSpacing: ".2em" }}>LOADING…</div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout planName={stats?.planName}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "1.5rem", color: G, marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: ".75rem", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace" }}>Manage your card appearance and account security</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 22, borderBottom: `1px solid ${BORDER}` }}>
        {(["card", "password"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "10px 20px", background: "transparent", border: "none", borderBottom: activeTab === t ? `2px solid ${G}` : "2px solid transparent", color: activeTab === t ? G : "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace", fontSize: ".75rem", letterSpacing: ".06em", cursor: "pointer", marginBottom: -1, textTransform: "capitalize" }}>
            {t === "card" ? "Card Settings" : "Change Password"}
          </button>
        ))}
      </div>

      {activeTab === "card" && (
        <div style={{ maxWidth: 620 }}>
          <form onSubmit={saveSettings} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Preview strip */}
            <div style={{ background: "rgba(0,255,0,0.03)", border: `1px solid ${BORDER}`, borderRadius: 11, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div>
                <div style={{ fontSize: ".65rem", color: "var(--gray-600)", marginBottom: 2 }}>Your public card URL</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: ".78rem", color: G }}>
                  {location.origin}/u/{(() => {
                    try { return JSON.parse(localStorage.getItem("wolf_user") ?? "null")?.username ?? "…"; } catch { return "…"; }
                  })()}
                </div>
              </div>
              <button type="button" className="btn-ghost" style={{ marginLeft: "auto", fontSize: ".68rem", padding: "6px 12px" }}
                onClick={() => window.open(`/u/${(() => { try { return JSON.parse(localStorage.getItem("wolf_user") ?? "null")?.username; } catch { return ""; } })()}`, "_blank")}>
                Preview ↗
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Display Name">
                <input style={inp} placeholder="Wolf Tech" value={settings.cardName ?? ""}
                  onChange={e => setSettings((s: any) => ({ ...s, cardName: e.target.value }))} />
              </Field>
              <Field label={`Contact Target (max ${stats?.maxContacts ?? 200})`}>
                <input style={inp} type="number" min={1} max={stats?.maxContacts ?? 200}
                  placeholder={String(stats?.maxContacts ?? 200)} value={settings.contactTarget ?? ""}
                  onChange={e => setSettings((s: any) => ({ ...s, contactTarget: e.target.value }))} />
              </Field>
            </div>

            <Field label="Bio / Tagline">
              <input style={inp} placeholder="I explore systems" value={settings.bio ?? ""}
                onChange={e => setSettings((s: any) => ({ ...s, bio: e.target.value }))} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="WhatsApp URL">
                <input style={inp} placeholder="https://wa.me/..." value={settings.whatsapp ?? ""}
                  onChange={e => setSettings((s: any) => ({ ...s, whatsapp: e.target.value }))} />
              </Field>
              <Field label="YouTube URL">
                <input style={inp} placeholder="https://youtube.com/@..." value={settings.youtube ?? ""}
                  onChange={e => setSettings((s: any) => ({ ...s, youtube: e.target.value }))} />
              </Field>
              <Field label="WhatsApp Channel">
                <input style={inp} placeholder="https://whatsapp.com/channel/..." value={settings.waChannel ?? ""}
                  onChange={e => setSettings((s: any) => ({ ...s, waChannel: e.target.value }))} />
              </Field>
              <Field label="WhatsApp Group">
                <input style={inp} placeholder="https://chat.whatsapp.com/..." value={settings.waGroup ?? ""}
                  onChange={e => setSettings((s: any) => ({ ...s, waGroup: e.target.value }))} />
              </Field>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn-solid" type="submit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Save Card Settings
              </button>
              {settingsMsg && <Msg text={settingsMsg} />}
            </div>
          </form>
        </div>
      )}

      {activeTab === "password" && (
        <div style={{ maxWidth: 400 }}>
          <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Current Password">
              <input style={inp} type="password" placeholder="••••••••" autoComplete="current-password"
                value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required />
            </Field>
            <Field label="New Password">
              <input style={inp} type="password" placeholder="Min 6 characters" autoComplete="new-password"
                value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} required />
            </Field>
            <Field label="Confirm New Password">
              <input style={inp} type="password" placeholder="Repeat" autoComplete="new-password"
                value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required />
            </Field>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn-solid" type="submit">Update Password</button>
              {pwMsg && <Msg text={pwMsg} />}
            </div>
          </form>
        </div>
      )}

    </DashboardLayout>
  );
}
