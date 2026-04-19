import { type ReactNode, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CircleX, Pencil, UserRoundSearch } from "lucide-react";
import DeactivateFarmerConfirmModal from "@/components/admin/DeactivateFarmerConfirmModal";
import cardPattern from "@/assets/comps/card-pattern-desktop.svg";
import { getAdminFarmerDetail, type AdminFarmerDetail } from "@/mockData/adminFarmers";

const ID_CARD_FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=280&h=280&q=80";

function FarmerDigitalIdCard({ detail }: { detail: AdminFarmerDetail }) {
  const { idCard } = detail;
  const photoSrc = idCard.photoUrl ?? ID_CARD_FALLBACK_PHOTO;
  const sigFirst = idCard.agentName.split(/\s+/)[0] ?? idCard.agentName;

  return (
    <div className="relative isolate w-full max-w-[360px] overflow-hidden rounded-[22px] bg-[#00684a] text-white shadow-[0_16px_40px_rgba(0,72,52,0.35)] ring-1 ring-inset ring-white/10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-center scale-[1.08] opacity-[0.5] contrast-[1.08]"
        style={{
          backgroundImage: `url(${cardPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#fef9c3]/14 mix-blend-soft-light" />
      <div className="pointer-events-none absolute inset-0 bg-[#004d3a]/35 mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-black/20" />

      <div className="relative z-10 px-5 pb-6 pt-6 [@media(max-height:760px)]:px-5 [@media(max-height:760px)]:pb-5 [@media(max-height:760px)]:pt-5">
        <div className="flex items-center justify-center">
          <img
            src="/brand/HFEI_Horizontal_Logo.svg"
            alt="HFEI by Hashmar"
            className="h-8 w-auto [@media(max-height:760px)]:h-7"
            draggable={false}
          />
        </div>

        <div className="mx-auto mt-3.5 flex h-[110px] w-[110px] shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/30 [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:h-[90px] [@media(max-height:760px)]:w-[90px]">
          <img src={photoSrc} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="mt-5 [@media(max-height:760px)]:mt-4">
          <p className="text-center font-sans text-[11px] font-medium uppercase tracking-wide text-white/70">
            Full Name
          </p>
          <p className="mt-1.5 text-center font-display text-[22px] font-bold leading-tight tracking-tight [@media(max-height:760px)]:text-lg">
            {idCard.fullName}
          </p>
        </div>

        <div className="mt-5 [@media(max-height:760px)]:mt-3">
          <p className="text-center font-sans text-[11px] font-medium uppercase tracking-wide text-white/70">
            Farmer ID
          </p>
          <p className="mt-1.5 text-center font-sans text-base font-bold tracking-tight [@media(max-height:760px)]:text-sm">
            {idCard.farmerId}
          </p>
        </div>

        <div className="mt-5 [@media(max-height:760px)]:mt-3">
          <p className="text-center font-sans text-[11px] font-medium uppercase tracking-wide text-white/70">
            Cooperative name
          </p>
          <p className="mt-1.5 text-center font-sans text-[15px] font-semibold leading-snug text-white [@media(max-height:760px)]:text-sm">
            {idCard.cooperativeName}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/20 pt-5 text-left [@media(max-height:760px)]:mt-5 [@media(max-height:760px)]:pt-4">
          <div>
            <p className="font-sans text-[11px] font-medium uppercase tracking-wide text-white/70">Agent name</p>
            <p className="mt-2 font-sans text-sm font-semibold leading-snug [@media(max-height:760px)]:mt-1 [@media(max-height:760px)]:text-xs">
              {idCard.agentName}
            </p>
          </div>
          <div>
            <p className="font-sans text-[11px] font-medium uppercase tracking-wide text-white/70">
              Agent signature
            </p>
            <div className="mt-2 flex min-h-[44px] items-end justify-center pb-0.5 [@media(max-height:760px)]:min-h-[36px]">
              <p
                className="font-serif text-[26px] italic leading-none text-white/95 drop-shadow-sm [@media(max-height:760px)]:text-[22px]"
                style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
              >
                {sigFirst}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 border-t border-white/20 pt-4 font-sans text-xs [@media(max-height:760px)]:mt-5 [@media(max-height:760px)]:pt-3">
          <div className="border-r border-white/25 pr-4 text-center">
            <p className="font-medium uppercase tracking-wide text-white/65">Issue date</p>
            <p className="mt-2 text-sm font-semibold [@media(max-height:760px)]:mt-1 [@media(max-height:760px)]:text-xs">
              {idCard.issueDate}
            </p>
          </div>
          <div className="pl-4 text-center">
            <p className="font-medium uppercase tracking-wide text-white/65">Expiry date</p>
            <p className="mt-2 text-sm font-semibold [@media(max-height:760px)]:mt-1 [@media(max-height:760px)]:text-xs">
              {idCard.expiryDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="min-w-[10rem] shrink-0 font-sans text-sm text-brand-text-secondary">{label}</span>
      <span className="font-sans text-sm font-semibold text-brand-text-primary">{value}</span>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[16px] border border-[#e4e4e4] bg-white p-5 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url(${cardPattern})`,
          backgroundSize: "160% auto",
          backgroundPosition: "50% 20%",
        }}
      />
      <div className="relative z-10">
        <h3 className="mb-4 font-sans text-sm font-medium text-brand-text-muted">{title}</h3>
        <div className="space-y-3">{children}</div>
      </div>
    </section>
  );
}

export default function AdminFarmerDetailPage() {
  const { farmerId = "" } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "id" ? "id" : "details";
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const detail = getAdminFarmerDetail(decodeURIComponent(farmerId));
  if (!detail) {
    return (
      <div className="rounded-[20px] border border-[#e4e4e4] bg-white p-8 text-center">
        <p className="font-sans text-sm text-brand-text-secondary">Farmer not found.</p>
        <button
          type="button"
          onClick={() => navigate("/farmers")}
          className="mt-4 font-sans text-sm font-semibold text-[#03624D] hover:underline"
        >
          Back to Farmer Management
        </button>
      </div>
    );
  }

  const base = `/farmers/${encodeURIComponent(detail.farmerId)}`;

  return (
    <div
      className={
        tab === "id"
          ? "flex min-h-full w-full flex-col gap-4 pb-3"
          : "w-full space-y-6 pb-4"
      }
    >
      <DeactivateFarmerConfirmModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() => {
          setDeactivateOpen(false);
          navigate("/farmers");
        }}
      />

      <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-[20px] font-bold leading-6 text-brand-text-primary">
            <button
              type="button"
              onClick={() => navigate("/farmers")}
              className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
              aria-label="Back to Farmer Management"
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
            Farmer Details
          </h2>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(`${base}/enrolling-agent`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#03624D] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5"
          >
            View enrolling profile
            <UserRoundSearch size={18} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={() => setDeactivateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#03624D] bg-white px-4 py-2.5 font-sans text-sm font-semibold text-[#03624D] transition hover:bg-[#03624D]/5"
          >
            Deactivate
            <CircleX size={18} strokeWidth={1.9} />
          </button>
          <button
            type="button"
            onClick={() => navigate(`${base}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-4 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99]"
          >
            Edit Details
            <Pencil size={18} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      <div className="inline-flex shrink-0 rounded-full bg-[#f0f0f0] p-1">
        <button
          type="button"
          onClick={() => {
            searchParams.delete("tab");
            setSearchParams(searchParams, { replace: true });
          }}
          className={`rounded-full px-5 py-2 font-sans text-sm font-semibold transition ${
            tab === "details"
              ? "bg-[#03624D] text-white shadow-sm"
              : "bg-white text-brand-text-secondary shadow-sm hover:text-brand-text-primary"
          }`}
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => setSearchParams({ tab: "id" }, { replace: true })}
          className={`rounded-full px-5 py-2 font-sans text-sm font-semibold transition ${
            tab === "id"
              ? "bg-[#03624D] text-white shadow-sm"
              : "bg-white text-brand-text-secondary shadow-sm hover:text-brand-text-primary"
          }`}
        >
          ID
        </button>
      </div>

      {tab === "details" ? (
        <div className="space-y-4">
          <InfoCard title="Enrolling Agent">
            <DetailField label="Full Name" value={detail.enrollingAgent.fullName} />
            <DetailField label="State" value={detail.enrollingAgent.state} />
            <DetailField label="Local government" value={detail.enrollingAgent.lga} />
          </InfoCard>
          <InfoCard title="Biometric Information">
            <DetailField label="Fingerprint" value={detail.biometric.fingerprint} />
            <DetailField label="Face" value={detail.biometric.face} />
          </InfoCard>
          <InfoCard title="Personal Information">
            <DetailField label="Full Name" value={detail.personal.fullName} />
            <DetailField label="Date of Birth" value={detail.personal.dateOfBirth} />
            <DetailField label="Gender" value={detail.personal.gender} />
            <DetailField label="Phone Number" value={detail.personal.phone} />
            <DetailField label="Address" value={detail.personal.address} />
            <DetailField label="NIN" value={detail.personal.nin} />
            <DetailField label="BVN" value={detail.personal.bvn} />
          </InfoCard>
          <InfoCard title="Farm Information">
            <DetailField label="Farm Size" value={detail.farm.farmSize} />
            <DetailField label="Farm Location" value={detail.farm.farmLocation} />
            <DetailField label="Crop Type" value={detail.farm.cropType} />
            <DetailField label="Soil Type" value={detail.farm.soilType} />
            <DetailField label="Land Ownership" value={detail.farm.landOwnership} />
          </InfoCard>
          <InfoCard title="Cooperative & Association">
            <DetailField label="Cooperative Name" value={detail.cooperative.cooperativeName} />
            <DetailField label="Registration Number" value={detail.cooperative.registrationNumber} />
            <DetailField label="Membership Role" value={detail.cooperative.membershipRole} />
            <DetailField label="LGA" value={detail.cooperative.lga} />
            <DetailField label="Commodity Focus" value={detail.cooperative.commodityFocus.join(", ")} />
            <DetailField label="Cooperative Size" value={detail.cooperative.cooperativeSize} />
            <DetailField label="Land Ownership Type" value={detail.cooperative.landOwnershipType} />
            <DetailField label="Farm Size (Hectares)" value={detail.cooperative.farmSizeHectares} />
            <DetailField label="Input Supplier" value={detail.cooperative.inputSupplier} />
          </InfoCard>
        </div>
      ) : (
        <div className="flex min-h-0 w-full flex-1 flex-col items-start justify-start px-1">
          <div
            className="flex w-full max-w-[360px] flex-col items-stretch gap-3 origin-top [@media(max-height:820px)]:scale-[0.94] [@media(max-height:720px)]:scale-[0.88] [@media(max-height:640px)]:scale-[0.82] [@media(max-height:560px)]:scale-[0.76]"
            style={{ transition: "transform 0.15s ease-out" }}
          >
            <FarmerDigitalIdCard detail={detail} />
            <button
              type="button"
              className="w-full shrink-0 rounded-full bg-[#00684a] py-3.5 font-sans text-base font-semibold text-white shadow-[0_8px_20px_rgba(0,72,52,0.28)] transition hover:brightness-[1.03] active:scale-[0.99] [@media(max-height:760px)]:py-3 [@media(max-height:760px)]:text-sm"
            >
              Share ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
