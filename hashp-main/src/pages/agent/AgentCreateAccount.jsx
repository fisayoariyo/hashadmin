import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Smartphone, Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import AgentAuthDesktopLayout from "../../components/agent/AgentAuthDesktopLayout";
import AgentFormFeedback from "../../components/agent/AgentFormFeedback";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { agentRegister, formatPhoneForApi } from "../../services/cropexApi";

const REG_KEY = "hcx_agent_registration";

function getSignupFieldErrors(error) {
  const body = error?.body;
  const status = Number(error?.status || 0);
  const rawMessage =
    typeof body?.errors === "string"
      ? body.errors
      : typeof error?.message === "string"
        ? error.message
        : "";

  const message = String(rawMessage || "");
  const next = {};

  if (status === 409) {
    const mentionsEmail = /email/i.test(message);
    const mentionsPhone = /phone|phone_number/i.test(message);

    if (mentionsEmail && !mentionsPhone) {
      next.email = "This email address is already in use.";
    }
    if (mentionsPhone && !mentionsEmail) {
      next.phone = "This phone number is already in use.";
    }
    return next;
  }

  if (/registrationrequest\.email/i.test(message) || /email tag/i.test(message)) {
    next.email = "Enter a valid email address.";
  }
  if (/registrationrequest\.phone/i.test(message) || /phone/i.test(message)) {
    next.phone = "Enter a valid phone number.";
  }
  if (/registrationrequest\.password/i.test(message) || /password/i.test(message)) {
    next.password = "Use a password with at least 8 characters.";
  }
  if (/registrationrequest\.full[_ ]?name/i.test(message) || /full[_ ]?name/i.test(message)) {
    next.fullName = "Enter your full name.";
  }
  if (/registrationrequest\.gender/i.test(message) || /gender/i.test(message)) {
    next.gender = "Select a valid gender.";
  }

  return next;
}

export default function AgentCreateAccount() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "Male",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (event) => {
    setError("");
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async () => {
    const nextFieldErrors = {};
    if (!form.fullName.trim()) nextFieldErrors.fullName = "Full name is required.";
    if (!form.phone.trim()) nextFieldErrors.phone = "Phone number is required.";
    if (!form.email.trim()) nextFieldErrors.email = "Email is required.";
    if (!form.password) nextFieldErrors.password = "Password is required.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setFieldErrors({ password: "Use at least 8 characters." });
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});
    try {
      const payload = {
        full_name: form.fullName.trim(),
        phone_number: formatPhoneForApi(form.phone),
        email: form.email.trim(),
        gender: form.gender,
        password: form.password,
      };
      await agentRegister(payload);

      sessionStorage.setItem(
        REG_KEY,
        JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone,
          phoneNumber: payload.phone_number,
          email: form.email.trim(),
          gender: form.gender,
          password: form.password,
          registeredAt: new Date().toISOString(),
        })
      );

      navigate("/agent/verify-phone", {
        state: { phone: form.phone, mode: "register" },
      });
    } catch (submitError) {
      const mappedFieldErrors = getSignupFieldErrors(submitError);
      if (Object.keys(mappedFieldErrors).length > 0) {
        setFieldErrors(mappedFieldErrors);
        setError("");
      } else if (submitError?.status === 409) {
        setError("An account already exists with this phone number or email.");
      } else {
        setError(submitError instanceof Error ? submitError.message : "Could not create the account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formFields = (
    <div className="space-y-5">
      {error && <AgentFormFeedback variant="error">{error}</AgentFormFeedback>}

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-brand-text-primary">Full Name</label>
        <div className={`flex items-center bg-white border rounded-2xl px-4 py-4 gap-3 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-all ${
          fieldErrors.fullName ? "border-red-400" : "border-brand-border"
        }`}>
          <User size={18} className="text-brand-text-muted shrink-0" />
          <input
            type="text"
            value={form.fullName}
            onChange={set("fullName")}
            placeholder="Write your full name here"
            className="flex-1 bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
          />
        </div>
        {fieldErrors.fullName ? <p className="font-sans text-xs text-red-500">{fieldErrors.fullName}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-brand-text-primary">Phone Number</label>
        <div className={`flex items-center bg-white border rounded-2xl px-4 py-4 gap-3 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-all ${
          fieldErrors.phone ? "border-red-400" : "border-brand-border"
        }`}>
          <Smartphone size={18} className="text-brand-text-muted shrink-0" />
          <div className="w-px h-5 bg-brand-border shrink-0" />
          <span className="text-sm text-brand-text-secondary shrink-0 font-medium">+234</span>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(event) =>
              {
                setError("");
                setFieldErrors((current) => ({ ...current, phone: "" }));
                setForm((current) => ({
                  ...current,
                  phone: event.target.value.replace(/\D/g, ""),
                }));
              }
            }
            placeholder="Input your phone number here"
            className="flex-1 bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
          />
        </div>
        {fieldErrors.phone ? <p className="font-sans text-xs text-red-500">{fieldErrors.phone}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-brand-text-primary">Email</label>
        <div className={`flex items-center bg-white border rounded-2xl px-4 py-4 gap-3 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-all ${
          fieldErrors.email ? "border-red-400" : "border-brand-border"
        }`}>
          <Mail size={18} className="text-brand-text-muted shrink-0" />
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="Enter your email here"
            className="flex-1 bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
          />
        </div>
        {fieldErrors.email ? <p className="font-sans text-xs text-red-500">{fieldErrors.email}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-brand-text-primary">Gender</label>
        <div className="relative">
          <select
            value={form.gender}
            onChange={set("gender")}
            className={`w-full bg-white border rounded-2xl px-4 py-4 text-sm text-brand-text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all pr-10 ${
              fieldErrors.gender ? "border-red-400" : "border-brand-border"
            }`}
          >
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted pointer-events-none" />
        </div>
        {fieldErrors.gender ? <p className="font-sans text-xs text-red-500">{fieldErrors.gender}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-sans text-sm font-medium text-brand-text-primary">Create your password</label>
        <div className={`flex items-center bg-white border rounded-2xl px-4 py-4 gap-3 focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent transition-all ${
          fieldErrors.password ? "border-red-400" : "border-brand-border"
        }`}>
          <Lock size={18} className="text-brand-text-muted shrink-0" />
          <input
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            placeholder="Create a strong password"
            className="flex-1 bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
          />
          <button type="button" onClick={() => setShowPass((value) => !value)} className="text-brand-text-muted shrink-0">
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {fieldErrors.password ? <p className="font-sans text-xs text-red-500">{fieldErrors.password}</p> : null}
      </div>

      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-brand-border" />
        <span className="font-sans text-sm text-brand-text-muted">or</span>
        <div className="flex-1 h-px bg-brand-border" />
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-brand-border bg-white text-brand-text-primary font-sans text-sm font-medium active:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Sign up with Google
      </button>
    </div>
  );

  const actions = (
    <div className="space-y-3">
      <button type="button" onClick={() => void handleSubmit()} disabled={loading} className="btn-primary">
        {loading ? "Creating account..." : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => navigate("/agent/login")}
        className="w-full py-4 rounded-3xl bg-gray-100 text-brand-green font-sans font-semibold text-sm"
      >
        I already have an account
      </button>
    </div>
  );

  if (isDesktop) {
    return (
      <AgentAuthDesktopLayout title="Create Agent Account" actions={actions}>
        {formFields}
      </AgentAuthDesktopLayout>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white" style={{ minHeight: "100dvh" }}>
      <div className="flex-1 overflow-y-auto px-5 pt-10 pb-6 w-full max-w-[480px] mx-auto">
        <h1 className="font-display font-bold text-[2rem] leading-tight text-brand-text-primary mb-8">Create Agent Account</h1>
        {formFields}
        <div className="space-y-3 pb-[max(2rem,env(safe-area-inset-bottom))] mt-5">
          <button type="button" onClick={() => void handleSubmit()} disabled={loading} className="btn-primary">
            {loading ? "Creating account..." : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/agent/login")}
            className="w-full text-center text-brand-green font-sans text-sm font-medium py-2"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
