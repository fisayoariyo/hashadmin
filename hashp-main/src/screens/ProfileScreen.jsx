import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, LogOut, RefreshCw } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { ProfileRowSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useFarmer } from "../hooks/useFarmer";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { ROUTES } from "../constants/routes";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-brand-border last:border-b-0">
      <p className="label-sm">{label}</p>
      <p className="value-md">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card mb-4">
      <h3 className="font-display font-bold text-xs text-brand-text-secondary uppercase tracking-wider mb-1">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { info } = useToast();
  const { farmer, loading, error, refetch } = useFarmer();
  const [showLogout, setShowLogout] = useState(false);
  useScrollToTop();

  const confirmLogout = () => {
    logout();
    info("You have been logged out", "See you soon!");
    navigate(ROUTES.VERIFY, { replace: true });
  };

  return (
    <div className="page-container">
      <ConfirmModal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={confirmLogout}
        title="Log out?"
        message="You will need your phone number and OTP to log back in."
        confirmLabel="Yes, log out"
        cancelLabel="Stay logged in"
        confirmVariant="danger"
      />

      <div className="page-content">
        <div className="flex items-center justify-between pt-2 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-brand-text-secondary"
          >
            <ArrowLeft size={18} />
            <span className="font-sans text-sm">Back</span>
          </button>
          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-1.5 text-red-500 active:opacity-70 transition-opacity"
          >
            <LogOut size={16} />
            <span className="font-sans text-sm font-medium">Logout</span>
          </button>
        </div>

        {loading && (
          <>
            <div className="flex items-center gap-4 mb-6 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
            <ProfileRowSkeleton count={5} />
          </>
        )}

        {error && (
          <EmptyState
            emoji="⚠️"
            title="Could not load profile"
            subtitle={error}
            action={
              <button onClick={refetch} className="flex items-center gap-2 text-brand-green font-semibold text-sm">
                <RefreshCw size={14} /> Retry
              </button>
            }
          />
        )}

        {!loading && !error && farmer && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={farmer.photo}
                alt={farmer.fullName}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div>
                <h1 className="font-display font-bold text-xl text-brand-text-primary">
                  {farmer.fullName}
                </h1>
                <p className="font-sans text-sm text-brand-text-secondary">
                  {farmer.id ?? farmer.farmerID}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <BadgeCheck size={13} className="text-brand-green" />
                  <span className="text-xs text-brand-green font-semibold font-sans">
                    {farmer.status}
                  </span>
                </div>
              </div>
            </div>

            <Section title="Personal Info">
              <InfoRow label="Full Name" value={farmer.fullName} />
              <InfoRow label="Date of Birth" value={farmer.dob} />
              <InfoRow label="Gender" value={farmer.gender} />
              <InfoRow label="Phone Number" value={farmer.phone} />
              <InfoRow label="Marital Status" value={farmer.maritalStatus} />
              <InfoRow label="Education Level" value={farmer.education} />
              <InfoRow label="State of Origin" value={farmer.state} />
              <InfoRow label="Local Government Area" value={farmer.lga} />
              <InfoRow label="Residential Address" value={farmer.address} />
            </Section>

            <Section title="Farming Info">
              <InfoRow label="Primary Crop" value={farmer.primaryCrop} />
              <InfoRow
                label="Secondary Crops"
                value={farmer.secondaryCrops?.join(", ")}
              />
              <InfoRow
                label="Years of Experience"
                value={`${farmer.yearsOfExperience} years`}
              />
              <InfoRow label="Farm Size" value={farmer.farmSize} />
              <InfoRow label="Land Ownership" value={farmer.landOwnershipType} />
            </Section>

            <Section title="Cooperative Info">
              <InfoRow label="Cooperative Name" value={farmer.cooperative} />
              <InfoRow label="Registration No." value={farmer.cooperativeRegNo} />
              <InfoRow label="Role" value={farmer.role} />
            </Section>

            <Section title="Next of Kin">
              <InfoRow label="Name" value={farmer.nextOfKin?.name} />
              <InfoRow label="Phone" value={farmer.nextOfKin?.phone} />
              <InfoRow
                label="Relationship"
                value={farmer.nextOfKin?.relationship}
              />
            </Section>

            <p className="text-center text-xs text-brand-text-muted font-sans px-4 mb-4">
              To update your profile, contact your Hashmar CropEx field agent.
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}


