import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ROUTES } from "../constants/routes";

// TODO: Replace with API call from src/services/api.js
import { verifyOTP } from "../services/api";

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

export default function OTPScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const phone = location.state?.phone || "";
  const farmerID = location.state?.farmerID || "";
  const from = location.state?.from || ROUTES.HOME;

  // Guard: if navigated here without state, send back to /verify
  useEffect(() => {
    if (!phone || !farmerID) {
      navigate(ROUTES.VERIFY, { replace: true });
    }
  }, [phone, farmerID, navigate]);

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // Separate refs — calling hooks in array literal is invalid
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const inputRefs = [ref0, ref1, ref2, ref3];

  const timerRef = useRef(null);

  useEffect(() => {
    ref0.current?.focus();
    startResendTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const startResendTimer = () => {
    setResendTimer(RESEND_SECONDS);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleChange = useCallback(
    (index, value) => {
      if (!/^\d?$/.test(value)) return;
      setDigits((prev) => {
        const updated = [...prev];
        updated[index] = value;
        return updated;
      });
      setError("");
      if (value && index < OTP_LENGTH - 1) {
        inputRefs[index + 1].current?.focus();
      }
    },
    [inputRefs]
  );

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    },
    [digits, inputRefs]
  );

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setDigits(updated);
    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs[nextIndex].current?.focus();
  };

  const handleResend = () => {
    if (!canResend) return;
    toastInfo("A new code has been sent to your number.", "Code Resent");
    setDigits(Array(OTP_LENGTH).fill(""));
    setError("");
    ref0.current?.focus();
    startResendTimer();
  };

  const handleLogin = async () => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Please enter the complete 4-digit code.");
      return;
    }
    setLoading(true);
    try {
      const result = await verifyOTP(phone, otp);
      if (result.success) {
        login({ token: result.token, farmerID });
        toastSuccess("You are now logged in", "Welcome back!");
        navigate(from, { replace: true });
      } else {
        setError("Incorrect code. Please check and try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        ref0.current?.focus();
      }
    } catch {
      toastError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone
    ? `+234 ${phone.slice(0, 3)}****${phone.slice(-3)}`
    : "";

  return (
    <div className="page-container bg-white">
      <div className="flex-1 flex flex-col px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-text-secondary mb-8"
        >
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Go back</span>
        </button>

        <h1 className="font-display font-bold text-[2rem] leading-tight text-brand-text-primary mb-2">
          Enter 4-Digit code
        </h1>
        <p className="font-sans text-sm text-brand-text-secondary mb-10">
          Enter the code we sent to{" "}
          <span className="font-semibold text-brand-text-primary">
            {maskedPhone}
          </span>
        </p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={`w-full h-16 text-center text-2xl font-bold font-display bg-white border-2 rounded-2xl focus:outline-none transition-colors ${
                digit
                  ? "border-brand-green text-brand-green"
                  : "border-brand-border text-brand-text-primary"
              } focus:border-brand-green`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-4 font-sans">{error}</p>
        )}

        <p className="font-sans text-sm text-brand-text-secondary">
          I did not receive a code,{" "}
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`font-semibold transition-colors ${
              canResend
                ? "text-brand-green active:opacity-70"
                : "text-brand-text-muted cursor-default"
            }`}
          >
            {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
          </button>
        </p>
      </div>

      <div className="px-6 pb-10 space-y-4">
        <button
          onClick={handleLogin}
          disabled={loading || digits.join("").length < OTP_LENGTH}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Login"}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full text-center text-brand-green font-sans text-sm py-2"
        >
          Back
        </button>
      </div>
    </div>
  );
}
