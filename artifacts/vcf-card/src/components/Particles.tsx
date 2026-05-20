import { useEffect, useRef } from "react";

export default function Particles({ count = 28 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${10 + Math.random() * 20}s`;
      p.style.animationDelay = `${Math.random() * 15}s`;
      p.style.width = p.style.height = `${1 + Math.random() * 2}px`;
      ref.current.appendChild(p);
    }
  }, [count]);
  return <div ref={ref} className="particles" />;
}
