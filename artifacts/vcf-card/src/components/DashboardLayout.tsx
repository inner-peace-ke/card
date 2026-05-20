import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import NeonBg from "@/components/NeonBg";
import WolfNav from "@/components/WolfNav";
import Sidebar from "@/components/Sidebar";
import { api, getUser, clearToken } from "@/lib/api";

interface Props {
  children: React.ReactNode;
  planName?: string;
}

export default function DashboardLayout({ children, planName }: Props) {
  const user = getUser();
  const [, nav] = useLocation();
  const [copied, setCopied] = useState(false);
  const cardUrl = `${location.origin}/u/${user?.username}`;

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
            <button className="btn-ghost" style={{ fontSize: ".7rem", padding: "6px 12px" }}
              onClick={() => window.open(`/u/${user?.username}`, "_blank")}>
              View Card ↗
            </button>
            <button className="btn-solid" style={{ fontSize: ".7rem", padding: "7px 14px" }} onClick={copyLink}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </>
        }
      />
      <Sidebar planName={planName} />
      <main style={{ marginLeft: 220, paddingTop: 64, minHeight: "100vh", position: "relative", zIndex: 10 }}>
        <div style={{ padding: "28px 28px 60px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
