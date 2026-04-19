import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  CircleX,
  MapPin,
  Phone,
  Save,
  User,
  Users,
} from "lucide-react";
import { getAdminFarmerDetail } from "@/mockData/adminFarmers";
import { useNigeriaStateLga } from "@/hooks/useNigeriaStateLga";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[16px] border border-[#e4e4e4] bg-white p-6 shadow-sm">
      <h3 className="mb-5 font-sans text-sm font-normal tracking-wide text-brand-text-muted">{title}</h3>
      {children}
    </section>
  );
}

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

/** Figma-style rhythm: wider horizontal gutters, consistent vertical rhythm between rows */
const grid3 = "grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-3 md:gap-x-8 md:gap-y-7";

export default function AdminFarmerEditPage() {
  const { farmerId = "" } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const id = decodeURIComponent(farmerId);
  const detail = getAdminFarmerDetail(id);
  const back = `/farmers/${encodeURIComponent(id)}`;
  const { states, getLgasForState } = useNigeriaStateLga();

  const fallbackState = states.includes("Oyo") ? "Oyo" : states[0] ?? "";
  const inferredStateFromFarmLocation = detail?.farm.farmLocation.split(",").at(-1)?.trim() ?? fallbackState;
  const initialStateOfOrigin = states.includes("Oyo")
    ? "Oyo"
    : states.includes(inferredStateFromFarmLocation)
      ? inferredStateFromFarmLocation
      : fallbackState;
  const [stateOfOrigin, setStateOfOrigin] = useState(initialStateOfOrigin);
  const originLgaOptions = useMemo(() => getLgasForState(stateOfOrigin), [getLgasForState, stateOfOrigin]);
  const inferredOriginLga = detail?.personal.address.includes("Ibadan")
    ? "Ibadan North"
    : detail?.enrollingAgent.lga ?? "";
  const [originLga, setOriginLga] = useState(
    originLgaOptions.includes(inferredOriginLga) ? inferredOriginLga : originLgaOptions[0] ?? "",
  );

  const cooperativeLgaOptions = useMemo(
    () => getLgasForState(stateOfOrigin),
    [getLgasForState, stateOfOrigin],
  );
  const [cooperativeLga, setCooperativeLga] = useState(
    cooperativeLgaOptions.includes(detail?.cooperative.lga ?? "")
      ? (detail?.cooperative.lga ?? "")
      : cooperativeLgaOptions[0] ?? "",
  );

  useEffect(() => {
    if (!originLgaOptions.includes(originLga)) {
      setOriginLga(originLgaOptions[0] ?? "");
    }
  }, [originLga, originLgaOptions]);

  useEffect(() => {
    if (!cooperativeLgaOptions.includes(cooperativeLga)) {
      setCooperativeLga(cooperativeLgaOptions[0] ?? "");
    }
  }, [cooperativeLga, cooperativeLgaOptions]);

  if (!detail) {
    return (
      <div className="rounded-[20px] border border-[#e4e4e4] bg-white p-8 text-center">
        <p className="font-sans text-sm text-brand-text-secondary">Farmer not found.</p>
        <button
          type="button"
          onClick={() => navigate("/farmers")}
          className="mt-4 font-sans text-sm font-semibold text-[#03624D] hover:underline"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 pb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <h2 className="flex items-center gap-2 font-display text-[20px] font-bold leading-6 text-brand-text-primary">
          <button
            type="button"
            onClick={() => navigate(back)}
            className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
            aria-label="Back to farmer"
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>
          Edit Farmer Details
        </h2>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(back)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#03624D] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5"
          >
            <CircleX size={18} strokeWidth={1.9} />
            Discard changes
          </button>
          <button
            type="button"
            onClick={() => navigate(back)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]"
          >
            <Save size={18} strokeWidth={1.9} />
            Save Changes
          </button>
        </div>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          navigate(back);
        }}
      >
        <Section title="Contact Information">
          <div className={grid3}>
            <FieldBlock label="Phone number" required>
              <InputShell>
                <Phone size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <span className="shrink-0 font-sans text-sm font-medium text-brand-text-secondary">
                  +234
                </span>
                <span className="h-6 w-px shrink-0 bg-[#e4e4e4]" aria-hidden />
                <input
                  name="phone"
                  type="tel"
                  defaultValue={detail.personal.phone.replace(/\s/g, "")}
                  placeholder="Input your phone number here"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </InputShell>
            </FieldBlock>
          </div>
        </Section>

        <Section title="Personal Information">
          <div className={grid3}>
            <FieldBlock label="State of origin" required>
              <SelectField name="stateOrigin" value={stateOfOrigin} onChange={setStateOfOrigin}>
                <option value="">Select</option>
                {states.map((stateOption) => (
                  <option key={stateOption} value={stateOption}>
                    {stateOption}
                  </option>
                ))}
              </SelectField>
            </FieldBlock>
            <FieldBlock label="Local government area" required>
              <SelectField name="lga" value={originLga} onChange={setOriginLga}>
                <option value="">Select</option>
                {originLgaOptions.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </SelectField>
            </FieldBlock>
            <FieldBlock label="Residential address" required>
              <InputShell>
                <MapPin size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="address"
                  type="text"
                  defaultValue={detail.personal.address}
                  placeholder="Street, city, state"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </InputShell>
            </FieldBlock>
          </div>
        </Section>

        <Section title="Farming Information">
          <div className={grid3}>
            <FieldBlock label="Crop Type" required>
              <SelectField name="crop" defaultValue={detail.farm.cropType}>
                <option value="">Select Crop type</option>
                <option value="Maize">Maize</option>
                <option value="Cassava">Cassava</option>
              </SelectField>
            </FieldBlock>
            <FieldBlock label="Land Ownership (Optional)">
              <SelectField name="landOwnership" defaultValue={detail.farm.landOwnership}>
                <option value="">Select ownership type (e.g. Owned, Leased)</option>
                <option value="Owned">Owned</option>
                <option value="Leased">Leased</option>
              </SelectField>
            </FieldBlock>
            <FieldBlock label="Farm Location" required>
              <InputShell>
                <MapPin size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="farmLocation"
                  type="text"
                  defaultValue={detail.farm.farmLocation}
                  placeholder="Farm address or area"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </InputShell>
            </FieldBlock>
            <FieldBlock label="Soil Type" required>
              <SelectField name="soil" defaultValue={detail.farm.soilType}>
                <option value="">Select Soil type</option>
                <option value="Loamy soil">Loamy soil</option>
                <option value="Clay">Clay</option>
              </SelectField>
            </FieldBlock>
          </div>
        </Section>

        <Section title="Corporative Information">
          <div className={grid3}>
            <FieldBlock label="Cooperative Name">
              <InputShell>
                <User size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="coopName"
                  type="text"
                  defaultValue={detail.cooperative.cooperativeName}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none"
                />
              </InputShell>
            </FieldBlock>
            <FieldBlock label="Cooperative Registration No.">
              <InputShell>
                <User size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="coopReg"
                  type="text"
                  defaultValue={detail.cooperative.registrationNumber}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none"
                />
              </InputShell>
            </FieldBlock>
            <FieldBlock label="Membership Role">
              <SelectField name="role" defaultValue={detail.cooperative.membershipRole}>
                <option value="Member">Member</option>
                <option value="Chair">Chair</option>
              </SelectField>
            </FieldBlock>
            <FieldBlock label="Date Joined">
              <InputShell>
                <Calendar size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="joined"
                  type="text"
                  placeholder="DD/MM/YYYY"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </InputShell>
            </FieldBlock>
            <FieldBlock label="LGA of Cooperative">
              <SelectField name="coopLga" value={cooperativeLga} onChange={setCooperativeLga}>
                <option value="">Select LGA</option>
                {cooperativeLgaOptions.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </SelectField>
            </FieldBlock>
            <FieldBlock label="Commodity Focus">
              <div className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-2xl border border-[#e4e4e4] bg-white px-4 py-2.5">
                {detail.cooperative.commodityFocus.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-lg border border-[#03624D] bg-white px-2.5 py-1 font-sans text-xs font-medium text-[#03624D]"
                  >
                    {c} +
                  </span>
                ))}
                <button
                  type="button"
                  className="rounded-lg border border-dashed border-[#c4c4c4] px-2 py-1 font-sans text-xs text-brand-text-muted hover:border-[#03624D] hover:text-[#03624D]"
                >
                  Add
                </button>
              </div>
            </FieldBlock>
            <FieldBlock label="Cooperative Size">
              <InputShell>
                <Users size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="coopSize"
                  type="text"
                  defaultValue={detail.cooperative.cooperativeSize.replace(/\D/g, "")}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none"
                />
              </InputShell>
            </FieldBlock>
            <FieldBlock label="Land Ownership Type">
              <SelectField name="landType" defaultValue={detail.cooperative.landOwnershipType}>
                <option value="Owned">Owned</option>
                <option value="Family">Family</option>
              </SelectField>
            </FieldBlock>
            <FieldBlock label="Input Supplier Name">
              <InputShell>
                <User size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="supplier"
                  type="text"
                  defaultValue={detail.cooperative.inputSupplier}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none"
                />
              </InputShell>
            </FieldBlock>
          </div>
        </Section>

        <Section title="Next of Kin information">
          <div className={grid3}>
            <FieldBlock label="Next of Kin Name" required>
              <InputShell>
                <User size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  name="nokName"
                  type="text"
                  placeholder="Full name"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </InputShell>
            </FieldBlock>
            <FieldBlock label="Next of Kin phone number" required>
              <InputShell>
                <Phone size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <span className="shrink-0 font-sans text-sm font-medium text-brand-text-secondary">
                  +234
                </span>
                <span className="h-6 w-px shrink-0 bg-[#e4e4e4]" aria-hidden />
                <input
                  name="nokPhone"
                  type="tel"
                  placeholder="Phone number"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </InputShell>
            </FieldBlock>
            <FieldBlock label="Next of Kin Relationship" required>
              <SelectField name="nokRel">
                <option value="">Select</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
              </SelectField>
            </FieldBlock>
          </div>
        </Section>
      </form>
    </div>
  );
}
