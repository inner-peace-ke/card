import { useLocation } from "wouter";
import { clearToken, getUser } from "@/lib/api";

const G = "var(--primary)";
const BORDER = "var(--primary-border)";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const [, nav] = useLocation();
  return (
    <button
      onClick={() => nav(item.href)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer",
        background: active ? "rgba(0,255,0,0.08)" : "transparent",
        borderLeft: active ? `2px solid ${G}` : "2px solid transparent",
        color: active ? G : "var(--gray-400)",
        fontFamily: "'JetBrains Mono',monospace", fontSize: ".72rem",
        letterSpacing: ".04em", textAlign: "left", transition: "all .15s",
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(0,255,0,0.04)"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <span style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span style={{ fontSize: ".6rem", background: G, color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

const icons = {
  overview: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  contacts: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  settings: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  plans: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  password: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  card: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

export default function Sidebar({ planName }: { planName?: string }) {
  const [loc, nav] = useLocation();
  const user = getUser();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: icons.overview },
    { href: "/dashboard/contacts", label: "Contacts", icon: icons.contacts },
    { href: "/dashboard/settings", label: "Card Settings", icon: icons.settings },
    { href: "/dashboard/plans", label: "Plans", icon: icons.plans, badge: planName?.toLowerCase() === "free" ? "FREE" : undefined },
    { href: "/dashboard/password", label: "Password", icon: icons.password },
  ];

  return (
    <div style={{
      position: "fixed", top: 64, left: 0, bottom: 0, width: 220,
      background: "rgba(0,0,0,0.97)", borderRight: `1px solid ${BORDER}`,
      display: "flex", flexDirection: "column", zIndex: 40,
      backdropFilter: "blur(12px)",
    }}>
      {/* User info */}
      <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(0,255,0,0.08)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: ".72rem", fontWeight: 700, color: G, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{user?.username}</div>
            <div style={{ fontSize: ".6rem", color: "var(--gray-600)", marginTop: 1 }}>{planName ?? "Free"} Plan</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(item => (
          <NavLink key={item.href} item={item} active={loc === item.href} />
        ))}

        <div style={{ margin: "10px 0", borderTop: `1px solid ${BORDER}` }} />

        {/* View Public Card */}
        <button
          onClick={() => window.open(`/u/${user?.username}`, "_blank")}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "var(--gray-500)", fontFamily: "'JetBrains Mono',monospace", fontSize: ".72rem", textAlign: "left" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,255,0,0.04)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <span style={{ opacity: 0.6 }}>{icons.card}</span>
          <span>View Public Card</span>
        </button>
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${BORDER}` }}>
        <button
          onClick={() => { clearToken(); nav("/login"); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "var(--red)", fontFamily: "'JetBrains Mono',monospace", fontSize: ".72rem", textAlign: "left" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--red-bg)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
