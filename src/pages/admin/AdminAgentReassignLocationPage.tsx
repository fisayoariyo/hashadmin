import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, CircleX, Save } from "lucide-react";
import { getAdminAgentDetail } from "@/mockData/adminAgents";
import { useNigeriaStateLga } from "@/hooks/useNigeriaStateLga";
import { reassignAgentLocation } from "@/lib/adminApi";

const outerCard =
  "rounded-2xl border border-[#E8E8E8] bg-white px-5 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-7 sm:py-7";

const innerCard = "rounded-xl border border-[#e4e4e4] bg-white px-5 py-6 sm:px-6 sm:py-6";

const cancelBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e4e4e4] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-brand-text-primary transition hover:bg-[#fafafa]";
const saveBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]";

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="font-sans text-sm font-semibold text-brand-text-primary">{label}</span>
      {children}
    </div>
  );
}

function SelectField({
  name,
  value,
  onChange,
  children,
}: {
  name: string;
  value: string;
  onChange: (next: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[52px] w-full cursor-pointer appearance-none rounded-xl border border-[#e4e4e4] bg-white py-2 pl-4 pr-11 font-sans text-sm text-brand-text-primary outline-none transition focus:border-[#03624D] focus:ring-1 focus:ring-[#03624D]"
      >
        {children}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-text-muted"
        strokeWidth={1.8}
        aria-hidden
      />
    </div>
  );
}

export default function AdminAgentReassignLocationPage() {
  const { agentId = "" } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(agentId);
  const agent = getAdminAgentDetail(id);
  const { states, getLgasForState } = useNigeriaStateLga();

  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lgasForState = useMemo(() => (state ? getLgasForState(state) : []), [getLgasForState, state]);

  useEffect(() => {
    if (!agent || states.length === 0) return;
    if (!states.includes(agent.state)) return;
    setState(agent.state);
    const list = getLgasForState(agent.state);
    setLga(list.includes(agent.lga) ? agent.lga : "");
  }, [agent, states, getLgasForState]);

  if (!agent) {
    return (
      <div className="w-full pb-4">
        <div className="rounded-2xl border border-[#e4e4e4] bg-white p-8 text-center shadow-sm">
          <p className="font-sans text-[15px] text-brand-text-secondary">Agent not found.</p>
          <button
            type="button"
            onClick={() => navigate("/agents")}
            className="mt-4 font-sans text-[15px] font-semibold text-[#03624D] hover:underline"
          >
            Back to Agent Management
          </button>
        </div>
      </div>
    );
  }

  const back = `/agents/${encodeURIComponent(agent.agentId)}`;

  return (
    <div className="w-full pb-4">
      <div className={outerCard}>
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!state || !lga) {
              setError("Select both state and LGA.");
              return;
            }
            setSaving(true);
            setError("");
            try {
              await reassignAgentLocation(agent.agentId, { state, lga });
              navigate(back);
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : "Could not reassign agent location.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="flex items-center gap-2.5 font-display text-[20px] font-bold leading-7 text-brand-text-primary">
              <button
                type="button"
                onClick={() => navigate(back)}
                className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                aria-label="Back to agent details"
              >
                <ArrowLeft size={22} strokeWidth={2} />
              </button>
              Reassign Location
            </h2>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end">
              <button type="button" className={cancelBtn} onClick={() => navigate(back)}>
                Cancel
                <CircleX size={18} strokeWidth={1.9} />
              </button>
              <button type="submit" className={saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
                <Save size={18} strokeWidth={1.9} />
              </button>
            </div>
          </div>

          <div className={innerCard}>
            <h3 className="mb-6 font-sans text-sm font-medium leading-5 text-[#9B9B9B]">
              Assign new location
            </h3>
            {error ? <p className="mb-4 font-sans text-sm text-red-600">{error}</p> : null}

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 md:gap-x-8">
              <FieldBlock label="State">
                <SelectField
                  name="state"
                  value={state}
                  onChange={(next) => {
                    setState(next);
                    setLga("");
                  }}
                >
                  <option value="">Select</option>
                  {states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>
              </FieldBlock>

              <FieldBlock label="Local government area">
                <SelectField name="lga" value={lga} onChange={setLga}>
                  <option value="">Select</option>
                  {lgasForState.map((lg) => (
                    <option key={lg} value={lg}>
                      {lg}
                    </option>
                  ))}
                </SelectField>
              </FieldBlock>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
