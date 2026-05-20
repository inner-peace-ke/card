import { useLocation } from "wouter";
import { getUser, clearToken } from "@/lib/api";

interface WolfNavProps {
  sub?: string;
  right?: React.ReactNode;
}

export default function WolfNav({ sub = "Digital Card Platform", right }: WolfNavProps) {
  const [, nav] = useLocation();
  const user = getUser();

  return (
    <nav className="wolf-nav">
      <div className="wolf-nav-inner">
        <div className="wolf-logo" onClick={() => nav(user ? "/dashboard" : "/")}>
          <div className="wolf-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div className="wolf-logo-text">
              <span className="green">WOLF</span><span className="dim">VCF</span>
            </div>
            <div className="wolf-logo-sub">{sub}</div>
          </div>
        </div>
        {right && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{right}</div>}
      </div>
    </nav>
  );
}
