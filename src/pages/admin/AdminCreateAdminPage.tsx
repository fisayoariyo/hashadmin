import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { registerAdmin } from "@/lib/adminApi";
import { getAdminAuthState } from "@/lib/adminSession";

function nationalToE164Like(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

export default function AdminCreateAdminPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const auth = getAdminAuthState();
    if (auth?.role !== "SUPER_ADMIN") {
      navigate("/dashboard", { replace: true });
      return;
    }
    setCheckingRole(false);
  }, [navigate]);

  const inputShell =
    "flex min-h-[52px] items-center gap-3 rounded-2xl border border-[#e4e4e4] bg-white px-4 transition focus-within:border-[#03624D] focus-within:ring-1 focus-within:ring-[#03624D]";

  if (checkingRole) {
    return <p className="font-sans text-sm text-brand-text-secondary">Checking permissions...</p>;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !email.trim() || !phone.trim() || password.length < 8) {
      setError("Enter full name, email, phone number, and a password of at least 8 characters.");
      return;
    }

    setSaving(true);
    try {
      await registerAdmin({
        fullName,
        email,
        phoneNumber: nationalToE164Like(phone),
        password,
      });
      setSuccess("Admin account created successfully.");
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create admin account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full pb-4">
      <div className="rounded-2xl border border-[#E8E8E8] bg-white px-5 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-7 sm:py-7">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="flex items-center gap-2.5 font-display text-[20px] font-bold leading-7 text-brand-text-primary">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-lg p-1 text-brand-text-muted hover:bg-black/[0.04] hover:text-brand-text-primary"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={22} strokeWidth={2} />
              </button>
              Create Admin
            </h2>
          </div>

          <p className="font-sans text-sm text-brand-text-secondary">
            Use the backend admin registration contract to create another admin account. Access control is still enforced by the backend.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-brand-text-primary">Full Name</label>
              <div className={inputShell}>
                <User size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-brand-text-primary">Email</label>
              <div className={inputShell}>
                <Mail size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-brand-text-primary">Phone Number</label>
              <div className={inputShell}>
                <Phone size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <span className="shrink-0 font-sans text-sm font-medium text-brand-text-secondary">+234</span>
                <div className="h-5 w-px shrink-0 bg-brand-border" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="9072639842"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-sans text-sm font-semibold text-brand-text-primary">Password</label>
              <div className={inputShell}>
                <Lock size={18} className="shrink-0 text-brand-text-muted" strokeWidth={1.65} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 font-sans text-sm outline-none placeholder:text-brand-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="shrink-0 text-brand-text-muted hover:text-brand-text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {error ? <p className="font-sans text-sm text-red-600">{error}</p> : null}
          {success ? <p className="font-sans text-sm text-[#03624D]">{success}</p> : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#03624D] px-5 py-3 font-sans text-sm font-semibold text-white shadow-[0_6px_14px_rgba(3,98,77,0.18)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
