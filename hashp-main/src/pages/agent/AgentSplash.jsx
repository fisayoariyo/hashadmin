import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AgentOnboarding from "../../components/agent/AgentOnboarding";
import { agentBrandSplash } from "../../mockData/agent";

export default function AgentSplash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("brand");
  const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

  useEffect(() => {
    if (isDesktop) {
      navigate("/agent/create-account", { replace: true });
    }
  }, [isDesktop, navigate]);

  useEffect(() => {
    if (isDesktop) return;
    if (phase !== "brand") return;
    const t = setTimeout(() => setPhase("onboarding"), 2600);
    return () => clearTimeout(t);
  }, [phase, isDesktop]);

  if (isDesktop) {
    return null;
  }

  if (phase === "brand") {
    return (
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ height: "100dvh" }}
      >
        <img
          src={agentBrandSplash.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  return <AgentOnboarding onDone={() => navigate("/agent/create-account")} />;
}
