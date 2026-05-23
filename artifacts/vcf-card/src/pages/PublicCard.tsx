import { useState, useEffect } from "react";
import { useParams } from "wouter";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import NeonBg from "@/components/NeonBg";
import WolfNav from "@/components/WolfNav";

function setMetaTag(attr: "property" | "name", key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

interface CardData {
  username: string; cardName: string; bio: string;
  whatsapp: string; youtube: string; waChannel: string; waGroup: string;
  count: number; target: number; percentage: number; targetReached: boolean; planName: string;
}

const socialLinks = (card: CardData) => [
  { href: card.whatsapp, icon: "💬", label: "WHATSAPP" },
  { href: card.youtube, icon: "▶", label: "YOUTUBE" },
  { href: card.waChannel, icon: "📡", label: "WA CHANNEL" },
  { href: card.waGroup, icon: "👥", label: "WA GROUP" },
].filter(s => s.href);

export default function PublicCard() {
  const { username } = useParams<{ username: string }>();
  const [card, setCard] = useState<CardData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" as any });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err" | "dup"; text: string } | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/u/${username}`)
      .then(r => r.json())
      .then(d => { if (d.error) setNotFound(true); else setCard(d); })
      .catch(() => setNotFound(true));
  }, [username]);

  useEffect(() => {
    if (!card) return;
    const title = `${card.cardName} (@${card.username}) — WolfVCF`;
    const desc = card.bio
      ? `${card.bio} | Join @${card.username}'s network on WolfVCF.`
      : `Join @${card.username}'s network. Submit your contact to get the VCF file.`;
    const img = `${window.location.origin}/api/u/${username}/og-image`;

    document.title = title;
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", desc);
    setMetaTag("property", "og:image", img);
    setMetaTag("property", "og:image:width", "1200");
    setMetaTag("property", "og:image:height", "630");
    setMetaTag("property", "og:type", "profile");
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", desc);
    setMetaTag("name", "twitter:image", img);
    setMetaTag("name", "description", desc);

    return () => {
      document.title = "WolfVCF — Collect Your Contacts";
      setMetaTag("property", "og:title", "WolfVCF — Collect Your Contacts");
      setMetaTag("property", "og:description", "Create a digital contact card in seconds. Share your link, collect contacts crowd-style, and download a VCF file when your target is reached.");
      setMetaTag("property", "og:image", "/og-image.svg");
    };
  }, [card, username]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (!isValidPhoneNumber(form.phone ?? "")) { setMsg({ type: "err", text: "Enter a valid phone number with country code" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/u/${username}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone }),
      });
      const data = await res.json();
      if (res.status === 409) { setMsg({ type: "dup", text: "This number is already in the list" }); return; }
      if (!res.ok) { setMsg({ type: "err", text: data.error ?? "Error submitting" }); return; }
      setCard(prev => prev ? { ...prev, count: data.count, target: data.target, percentage: data.percentage, targetReached: data.targetReached } : prev);
      setDone(true);
    } finally { setSubmitting(false); }
  }

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, position: "relative" }}>
      <NeonBg />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🐺</div>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "var(--gray-500)" }}>Card not found</div>
        <a href="/" style={{ display: "block", marginTop: 14, fontSize: 11, color: "var(--primary)" }}>← Get your own WolfVCF card →</a>
      </div>
    </div>
  );

  if (!card) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", position: "relative" }}>
      <NeonBg />
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, letterSpacing: ".15em", position: "relative", zIndex: 1 }}>LOADING…</div>
    </div>
  );

  const pct = Math.min(card.percentage, 100);
  const links = socialLinks(card);

  return (
    <div style={{ minHeight: "100vh", background: "#000", position: "relative" }}>
      <NeonBg />
      <WolfNav sub={`@${card.username}`} />

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "84px 14px 60px", position: "relative", zIndex: 10 }}>

        {/* Header card */}
        <div className="wolf-card" style={{ padding: "22px 22px", marginBottom: 12 }}>
          <div className="wolf-card-top" />
          <div style={{ marginTop: 2, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "1.35rem", color: "var(--primary)", letterSpacing: "-.01em" }}>{card.cardName}</h1>
              {card.bio && <p style={{ fontSize: 12, color: "var(--gray-400)", marginTop: 5, lineHeight: 1.5 }}>{card.bio}</p>}
              <p style={{ fontSize: 10, color: "var(--gray-600)", marginTop: 4 }}>@{card.username}</p>
            </div>
            <div className="wolf-badge" style={{ flexShrink: 0 }}>
              <div className="wolf-badge-dot" /> LIVE
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="wolf-card" style={{ padding: "16px 20px", marginBottom: 12 }}>
          <div className="wolf-card-top" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace" }}>
              {card.count} collected
            </span>
            <span style={{ fontSize: 10, color: card.targetReached ? "var(--primary)" : "var(--gray-600)", fontFamily: "'JetBrains Mono',monospace", fontWeight: card.targetReached ? 700 : 400 }}>
              {card.targetReached ? "✓ TARGET REACHED" : `${card.target} target`}
            </span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          <div style={{ fontSize: 10, color: "var(--gray-600)", textAlign: "center", marginTop: 8 }}>
            {card.targetReached ? "🎉 Target reached — submit your contact to download" : `🔒 VCF unlocks at ${card.target} contacts`}
          </div>
        </div>

        {/* Contact form */}
        <div className="wolf-card" style={{ padding: "18px 20px", marginBottom: 12 }}>
          <div className="wolf-card-top" />
          <div className="wolf-label" style={{ marginBottom: 14 }}>Submit Your Contact</div>

          {done ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(0,255,0,0.08)", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: "var(--primary)", marginBottom: 5 }}>Contact Saved</div>
              <div style={{ fontSize: 11, color: "var(--gray-500)", lineHeight: 1.5 }}>Thanks for joining @{card.username}'s network.</div>

              {/* VCF download — only visible after submitting contact */}
              {card.targetReached ? (
                <a href={`/api/u/${username}/download`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18, padding: "12px", background: "linear-gradient(135deg,rgba(0,160,0,.9),rgba(0,255,0,.85))", borderRadius: 9, color: "#000", fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 12, letterSpacing: ".06em", textDecoration: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  DOWNLOAD VCF
                </a>
              ) : (
                <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(0,255,0,0.04)", border: "1px solid rgba(0,255,0,0.12)", fontSize: 11, color: "var(--gray-500)", lineHeight: 1.6 }}>
                  ⏳ You're on the list!<br />
                  <span style={{ color: "var(--gray-600)" }}>VCF will be ready once {card.target} contacts are collected.</span>
                </div>
              )}

              <button className="btn-ghost" style={{ marginTop: 14, fontSize: 10 }}
                onClick={() => { setDone(false); setForm({ fullName: "", phone: "" }); }}>
                Submit another →
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <input className="wolf-input" placeholder="Full name" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />

              <div>
                <div style={{ background: "rgba(0,0,0,0.6)", border: "1px solid var(--primary-border)", borderRadius: 9, padding: "4px 10px" }}>
                  <PhoneInput
                    international defaultCountry="KE"
                    value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))}
                  />
                </div>
                {form.phone && (
                  <div style={{ fontSize: 9, marginTop: 3, color: isValidPhoneNumber(form.phone) ? "var(--primary)" : "var(--gray-600)" }}>
                    {isValidPhoneNumber(form.phone) ? `✓ Saves as: ${form.phone}` : "Enter full number with country code"}
                  </div>
                )}
              </div>

              {msg && (
                <div style={{ padding: "8px 12px", borderRadius: 7, fontSize: 11, display: "flex", gap: 6, alignItems: "center", color: msg.type === "dup" ? "#ffaa00" : msg.type === "err" ? "var(--red)" : "var(--primary)", background: msg.type === "dup" ? "rgba(255,170,0,0.07)" : msg.type === "err" ? "var(--red-bg)" : "rgba(0,255,0,0.05)", border: `1px solid ${msg.type === "dup" ? "rgba(255,170,0,0.25)" : msg.type === "err" ? "var(--red-border)" : "rgba(0,255,0,0.2)"}` }}>
                  ⚠ {msg.text}
                </div>
              )}

              <button className="btn-solid" type="submit" disabled={submitting} style={{ width: "100%", marginTop: 2 }}>
                {submitting
                  ? <><span className="spin" style={{ display: "inline-block", width: 13, height: 13, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%" }} /> Saving…</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> SAVE CONTACT</>
                }
              </button>
            </form>
          )}
        </div>

        {/* Social links */}
        {links.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(links.length, 4)},1fr)`, gap: 8, marginBottom: 14 }}>
            {links.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="wolf-card wolf-card-hover"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px", textDecoration: "none" }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <span style={{ fontSize: 8, color: "var(--gray-500)", letterSpacing: ".1em", fontFamily: "'JetBrains Mono',monospace" }}>{s.label}</span>
              </a>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 9, color: "var(--gray-600)" }}>
          Powered by{" "}
          <a href="/" style={{ color: "rgba(0,255,0,0.4)", textDecoration: "none" }}>WolfVCF</a>
        </div>
      </div>
    </div>
  );
}
