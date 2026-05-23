import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import NeonBg from "@/components/NeonBg";
import WolfNav from "@/components/WolfNav";
import Sidebar from "@/components/Sidebar";
import { getUser } from "@/lib/api";

interface Props {
  children: React.ReactNode;
  planName?: string;
}

export default function DashboardLayout({ children, planName }: Props) {
  const user = getUser();
  const [, nav] = useLocation();
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardUrl = `${location.origin}/u/${user?.username}`;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function copyLink() {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <NeonBg />
      <WolfNav
        sub="Command Center"
        right={
          <>
            {isMobile ? (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{ background: "rgba(0,255,0,0.06)", border: "1px solid var(--primary-border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}
                aria-label="Menu"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            ) : (
              <>
                <button className="btn-ghost" style={{ fontSize: ".7rem", padding: "6px 12px" }}
                  onClick={() => window.open(`/u/${user?.username}`, "_blank")}>
                  View Card ↗
                </button>
                <button className="btn-solid" style={{ fontSize: ".7rem", padding: "7px 14px" }} onClick={copyLink}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </>
            )}
          </>
        }
      />

      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 39, backdropFilter: "blur(2px)" }}
        />
      )}

      <Sidebar
        planName={planName}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main style={{
        marginLeft: isMobile ? 0 : 220,
        paddingTop: 64,
        minHeight: "100vh",
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{ padding: isMobile ? "20px 14px 60px" : "28px 28px 60px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
