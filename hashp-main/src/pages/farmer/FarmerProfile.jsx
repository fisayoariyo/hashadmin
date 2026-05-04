import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, User } from "lucide-react";
import FarmerDesktopLayout from "../../components/farmer/FarmerDesktopLayout";
import { getFarmerDashboard } from "../../services/cropexApi";

function MobileBottomNav() {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-50">
      <div className="bg-white border-t border-brand-border flex items-center justify-around px-4 py-2">
        {[
          { label: "Home", Icon: Home, path: "/farmer/home", active: false },
          { label: "My profile", Icon: User, path: "/farmer/profile", active: true },
        ].map(({ label, Icon, path, active }) => (
          <button key={path} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center">
            <div className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all ${active ? "bg-brand-green" : ""}`}>
              <Icon size={22} strokeWidth={1.8} className={active ? "text-white" : "text-brand-green"} />
              <span className={`text-xs font-sans font-medium ${active ? "text-white" : "text-brand-text-secondary"}`}>{label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <p className="font-sans text-sm text-brand-text-primary py-1.5 border-b border-brand-border last:border-0">
      {label} : <span className="font-semibold">{value || "-"}</span>
    </p>
  );
}

function Section({ title, rows }) {
  return (
    <div className="mb-5">
      <p className="font-sans text-xs text-brand-text-muted uppercase tracking-wider mb-2">{title}</p>
      {rows.map(([label, value]) => (
        <Row key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function ProfileContent({ profile }) {
  return (
    <>
      <Section title="Biometric Information" rows={[["Fingerprint", "Captured"], ["Face", "Captured"]]} />
      <Section
        title="Personal Information"
        rows={[
          ["Full Name", profile.name],
          ["Date of Birth", profile.dob],
          ["Gender", profile.gender],
          ["Phone Number", profile.phone],
          ["Address", profile.address],
          ["NIN", profile.nin],
        ]}
      />
      <Section
        title="Farm Information"
        rows={[
          ["Farm Size", profile.farmSize],
          ["Farm Location", profile.farmLocation],
          ["Crop Type", profile.cropType],
          ["Soil Type", profile.soilType],
          ["Land Ownership", profile.landOwnership],
        ]}
      />
      <Section
        title="Cooperative & Association"
        rows={[
          ["Cooperative Name", profile.cooperativeName],
          ["Registration Number", profile.registrationNumber],
          ["Membership Role", profile.membershipRole],
          ["LGA", profile.lga],
          ["Commodity Focus", profile.cropType],
          ["Cooperative Size", profile.cooperativeSize],
          ["Land Ownership Type", profile.landOwnership],
          ["Farm Size (Hectares)", profile.farmSize],
          ["Input Supplier", profile.inputSupplier],
        ]}
      />
    </>
  );
}

export default function FarmerProfile() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getFarmerDashboard()
      .then((payload) => {
        if (!active) return;
        setDashboard(payload);
        setError("");
      })
      .catch((fetchError) => {
        if (!active) return;
        setDashboard(null);
        setError(fetchError instanceof Error ? fetchError.message : "Could not load your profile right now.");
      });
    return () => {
      active = false;
    };
  }, []);

  const farmer = dashboard?.farmer;
  const profile = useMemo(() => {
    return {
      name: farmer?.full_name || "-",
      dob: farmer?.date_of_birth || "-",
      gender: farmer?.gender || "-",
      phone: farmer?.phone_number || "-",
      address: farmer?.residential_address || "-",
      nin: farmer?.nin || "-",
      farmSize: farmer?.farm_size || "-",
      farmLocation: farmer?.farm_location || farmer?.residential_address || "-",
      cropType:
        (Array.isArray(farmer?.primary_crops) && farmer.primary_crops[0]) ||
        farmer?.crop_type ||
        "-",
      soilType: farmer?.soil_type || "-",
      landOwnership: farmer?.land_ownership || "-",
      cooperativeName: "-",
      registrationNumber: "-",
      membershipRole: "-",
      lga: farmer?.lga || "-",
      cooperativeSize: "-",
      inputSupplier: "-",
    };
  }, [farmer]);

  return (
    <>
      <div className="md:hidden page-container">
        <div className="flex-1 px-4 pt-5 pb-28 overflow-y-auto scrollbar-hide">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
              {error}
            </div>
          )}
          <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-1">Your profile</h1>
          <p className="font-sans text-xs text-brand-text-secondary mb-5">
            If you notice any mistake in your details, please contact your agent to make corrections.
          </p>
          <ProfileContent profile={profile} />
        </div>
        <MobileBottomNav />
      </div>

      <FarmerDesktopLayout activeNav="Profile" islandContent edgeToEdge>
        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700">
            {error}
          </div>
        )}
        <button
          onClick={() => navigate("/farmer/home")}
          className="flex items-center gap-2 text-brand-text-secondary mb-4 hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-1">Your profile</h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-6">
          If you notice any mistake in your details, please contact your agent to make corrections.
        </p>
        <div className="w-full max-w-none">
          <ProfileContent profile={profile} />
        </div>
      </FarmerDesktopLayout>
    </>
  );
}
