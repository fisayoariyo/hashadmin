import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, CircleX, Mail, Phone, Save } from "lucide-react";
import { getAdminAgentDetail } from "@/mockData/adminAgents";

const grid3 = "grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3 md:gap-x-8 md:gap-y-7";

const cardShell =
  "rounded-2xl border border-[#E8E8E8] bg-white px-5 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-7 sm:py-7";

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="font-sans text-sm font-semibold text-brand-text-primary">
      {children}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
  );
}

function FieldBlock({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

function InputShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-[#e4e4e4] bg-white px-4 transition focus-within:border-[#03624D] focus-within:ring-1 focus-within:ring-[#03624D]">
      {children}
    </div>
  );
}

function SelectField({
  name,
  value,
  defaultValue,
  onChange,
  children,
}: {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (nextValue: string) => void;
  children: ReactNode;
}) {
  const valueProps = value !== undefined ? { value } : { defaultValue };

  return (
    <div className="relative">
      <select
        name={name}
        {...valueProps}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-[52px] w-full cursor-pointer appearance-none rounded-2xl border border-[#e4e4e4] bg-white py-2 pl-4 pr-11 font-sans text-sm text-brand-text-primary outline-none transition focus:border-[#03624D] focus:ring-1 focus:ring-[#03624D]"
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

/** National mobile without leading 0, for +234 field */
function nationalMobileDigits(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("234") && d.length > 3) return d.slice(3);
  if (d.startsWith("0") && d.length > 1) return d.slice(1);
  return d;
}

export default function AdminAgentEditPage() {
  const { agentId = "" } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(agentId);
  const agent = getAdminAgentDetail(id);
  const [gender, setGender] = useState(agent?.gender ?? "Male");

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

  const outlineGreen =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#03624D] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5";
  const primaryGreen =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]";

  return (
    <div className="w-full pb-4">
      <div className={cardShell}>
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(back);
          }}
        >
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="flex items-center gap-2.5 font-display text-[20px] font-bold leading-7 text-brand-text-primary">
              <button
                type="button"
                onClick={() => navigate(back)}
                className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                aria-label="Back to agent details"
              >
                <ArrowLeft size={22} strokeWidth={2} />
              </button>
              Edit Agent Details
            </h2>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <button type="button" className={outlineGreen} onClick={() => navigate(back)}>
                Discard changes
                <CircleX size={18} strokeWidth={1.9} />
              </button>
              <button type="submit" className={primaryGreen}>
                Save Changes
                <Save size={18} strokeWidth={1.9} />
              </button>
            </div>
          </div>

          <h3 className="mb-5 font-sans text-sm font-medium leading-5 text-[#9B9B9B]">Personal Information</h3>

          <div className={grid3}>
            <FieldBlock label="Phone number" required>
              <InputShell>
                <Phone size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <span className="shrink-0 font-sans text-sm font-medium text-brand-text-secondary">+234</span>
                <span className="h-6 w-px shrink-0 bg-[#e4e4e4]" aria-hidden />
                <input
                  name="phone"
                  type="tel"
                  defaultValue={nationalMobileDigits(agent.phone)}
                  placeholder="Input your phone number here"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                  autoComplete="tel"
                />
              </InputShell>
            </FieldBlock>

            <FieldBlock label="Email">
              <InputShell>
                <Mail size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="email"
                  type="email"
                  defaultValue={agent.email}
                  placeholder="Enter your email here"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                  autoComplete="email"
                />
              </InputShell>
            </FieldBlock>

            <FieldBlock label="Gender">
              <SelectField name="gender" value={gender} onChange={setGender}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </SelectField>
            </FieldBlock>
          </div>
        </form>
      </div>
    </div>
  );
}
