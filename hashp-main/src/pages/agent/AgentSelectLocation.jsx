import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import AgentFormFeedback from "../../components/agent/AgentFormFeedback";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import {
  completeAgentRegistration,
  extractGeoArray,
  getGeoLgas,
  getGeoStates,
  mapGeoLgaOption,
  mapGeoStateOption,
} from "../../services/cropexApi";

const REG_KEY = "hcx_agent_registration";

function formatPhoneForLocalStore(digits) {
  const normalized = String(digits || "").replace(/\D/g, "");
  if (!normalized) return "";
  if (normalized.startsWith("234")) return `+${normalized}`;
  if (normalized.startsWith("0")) return `+234${normalized.slice(1)}`;
  return `+234${normalized}`;
}

export default function AgentSelectLocation() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [stateId, setStateId] = useState("");
  const [stateName, setStateName] = useState("");
  const [lga, setLga] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(REG_KEY)) navigate("/agent/create-account", { replace: true });
    } catch {
      navigate("/agent/create-account", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;
    setGeoLoading(true);
    setRegError("");
    getGeoStates()
      .then((payload) => {
        if (!active) return;
        const nextStates = extractGeoArray(payload).map(mapGeoStateOption).filter(Boolean);
        setStates(nextStates);
      })
      .catch((error) => {
        if (!active) return;
        setRegError(error instanceof Error ? error.message : "Could not load states.");
      })
      .finally(() => {
        if (active) setGeoLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!stateId) {
      setLgas([]);
      setLga("");
      return;
    }

    let active = true;
    setGeoLoading(true);
    setRegError("");
    getGeoLgas(stateId)
      .then((payload) => {
        if (!active) return;
        const nextLgas = extractGeoArray(payload).map(mapGeoLgaOption).filter(Boolean);
        setLgas(nextLgas);
      })
      .catch((error) => {
        if (!active) return;
        setRegError(error instanceof Error ? error.message : "Could not load local governments.");
      })
      .finally(() => {
        if (active) setGeoLoading(false);
      });

    return () => {
      active = false;
    };
  }, [stateId]);

  const handleContinue = async () => {
    if (!stateName || !lga) return;

    setLoading(true);
    setRegError("");
    try {
      const raw = sessionStorage.getItem(REG_KEY);
      const reg = raw ? JSON.parse(raw) : {};
      const password = reg.password || "";
      if (password.length < 8) {
        setRegError("Password must be at least 8 characters. Go back to create account and set your password.");
        return;
      }

      sessionStorage.setItem(
        REG_KEY,
        JSON.stringify({
          ...reg,
          stateId,
          state: stateName,
          lga,
          phone: formatPhoneForLocalStore(reg.phone),
          submittedAt: new Date().toISOString(),
        })
      );
      await completeAgentRegistration({
        state: stateName,
        lga,
      });
      sessionStorage.removeItem("hcx_agent_review_refresh_count");
      navigate("/agent/account-under-review");
    } catch (submitError) {
      setRegError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save your selected location. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formBody = (
    <div className="space-y-5 w-full max-w-md mx-auto">
      {regError && <AgentFormFeedback variant="error">{regError}</AgentFormFeedback>}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-brand-text-primary">State</label>
        <div className="relative">
          <select
            value={stateId}
            onChange={(event) => {
              const selectedId = event.target.value;
              const selectedState = states.find((item) => item.id === selectedId);
              setStateId(selectedId);
              setStateName(selectedState?.name || "");
              setLga("");
            }}
            disabled={geoLoading && states.length === 0}
            className="w-full bg-white border border-brand-border rounded-2xl px-4 py-3.5 text-sm text-brand-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green disabled:opacity-50"
          >
            <option value="">{geoLoading && states.length === 0 ? "Loading states..." : "Select state"}</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-sm font-medium text-brand-text-primary">Local government</label>
        <div className="relative">
          <select
            value={lga}
            onChange={(event) => setLga(event.target.value)}
            disabled={!stateId || (geoLoading && lgas.length === 0)}
            className="w-full bg-white border border-brand-border rounded-2xl px-4 py-3.5 text-sm text-brand-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green disabled:opacity-50"
          >
            <option value="">
              {!stateId
                ? "Select state first"
                : geoLoading && lgas.length === 0
                  ? "Loading local governments..."
                  : "Select local government"}
            </option>
            {lgas.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none" />
        </div>
      </div>
    </div>
  );

  const actions = (
    <div className="space-y-3 w-full max-w-sm">
      <button
        type="button"
        onClick={() => void handleContinue()}
        disabled={loading || !stateName || !lga}
        className="btn-primary w-full disabled:opacity-40"
      >
        {loading ? "Please wait..." : "Continue"}
      </button>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="w-full py-4 rounded-3xl bg-gray-100 text-brand-green font-sans font-semibold text-sm"
      >
        Back
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <AgentAuthDesktopLayout
        centerTitle
        title="Select your assigned location"
        subtitle="Select the location you were assigned to"
        actions={actions}
      >
        {formBody}
      </AgentAuthDesktopLayout>
    );
  }

  return (
    <div className="page-white flex flex-col min-h-dvh">
      <div className="flex-1 px-5 pt-6">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-text-secondary mb-6">
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-3xl text-brand-text-primary mb-2">Select your assigned location</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-8">
          Select the location you were assigned to
        </p>
        {formBody}
      </div>
      <div className="px-5 pb-8 space-y-3">{actions}</div>
    </div>
  );
}
