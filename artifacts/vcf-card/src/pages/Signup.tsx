import { useState } from "react";
import { useLocation } from "wouter";
import NeonBg from "@/components/NeonBg";
import WolfNav from "@/components/WolfNav";
import { api, setToken, setUser } from "@/lib/api";

export default function Signup() {
  const [, nav] = useLocation();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) { setErr("Passwords don't match"); return; }
    setLoading(true);
    try {
      const data = await api.post("/auth/signup", { username: form.username, email: form.email, password: form.password });
      setToken(data.token);
      setUser({ username: data.username });
      nav("/dashboard");
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
      <NeonBg />
      <WolfNav sub="Create your free card" />

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 16px 40px", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 400 }} className="fade-in-up">

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="wolf-badge" style={{ margin: "0 auto 16px" }}>
              <div className="wolf-badge-dot" />
              Free forever · No card needed
            </div>
            <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "1.7rem", letterSpacing: "-.01em" }}>
              <span style={{ color: "#fff" }}>CREATE </span>
              <span style={{ color: "var(--primary)" }}>ACCOUNT</span>
            </h1>
          </div>

          <div className="wolf-card">
            <div className="wolf-card-top" />
            <div style={{ padding: "28px 24px" }}>
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div>
                  <label className="wolf-label">Username</label>
                  <input className="wolf-input" placeholder="yourname (a-z, 0-9, _)" value={form.username}
                    onChange={set("username")} required autoFocus autoComplete="username" />
                  {form.username && (
                    <div style={{ fontSize: 10, color: "var(--gray-600)", marginTop: 4 }}>
                      🔗 Your card: /u/{form.username.toLowerCase()}
                    </div>
                  )}
                </div>

                <div>
                  <label className="wolf-label">Email</label>
                  <input className="wolf-input" type="email" placeholder="you@example.com" value={form.email}
                    onChange={set("email")} required autoComplete="email" />
                </div>

                <div>
                  <label className="wolf-label">Password</label>
                  <input className="wolf-input" type="password" placeholder="Min 6 characters" value={form.password}
                    onChange={set("password")} required autoComplete="new-password" />
                </div>

                <div>
                  <label className="wolf-label">Confirm Password</label>
                  <input className="wolf-input" type="password" placeholder="Repeat password" value={form.confirm}
                    onChange={set("confirm")} required autoComplete="new-password" />
                </div>

                {err && (
                  <div style={{ padding: "9px 13px", background: "var(--red-bg)", border: "1px solid var(--red-border)", borderRadius: 8, fontSize: 11, color: "var(--red)", display: "flex", gap: 6, alignItems: "center" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {err}
                  </div>
                )}

                <button className="btn-solid" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
                  {loading
                    ? <><span className="spin" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%" }} /> Creating…</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> CREATE ACCOUNT</>
                  }
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "var(--gray-500)" }}>
                Already have an account?{" "}
                <span style={{ color: "var(--primary)", cursor: "pointer" }} onClick={() => nav("/login")}>
                  Login →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
