import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Headphones,
  Mail,
  Phone,
  User,
} from "lucide-react";
import FarmerDesktopLayout from "../../components/farmer/FarmerDesktopLayout";
import { farmerFAQs, farmerSupportContact } from "../../mockData/farmer";
import { getFarmerIdCard } from "../../services/cropexApi";

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((value) => !value)}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform border border-brand-border"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-sans font-semibold text-sm text-brand-text-primary">{faq.question}</p>
        {open ? (
          <ChevronUp size={16} className="text-brand-green shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={16} className="text-brand-text-muted shrink-0 mt-0.5" />
        )}
      </div>
      {open && (
        <p className="font-sans text-sm text-brand-text-secondary mt-3 border-t border-brand-border pt-3 leading-relaxed">
          {faq.answer}
        </p>
      )}
    </button>
  );
}

function FAQContent() {
  return (
    <div className="space-y-3">
      {farmerFAQs.map((faq) => (
        <FAQItem key={faq.id} faq={faq} />
      ))}
    </div>
  );
}

function ContactContent({ agentName, loading, error }) {
  const supportPhone = farmerSupportContact.phone;
  const supportEmail = farmerSupportContact.email;

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-2xl p-5 border border-brand-border">
        <div className="w-10 h-10 rounded-xl bg-brand-green-muted flex items-center justify-center mb-3">
          <Headphones size={20} className="text-brand-green" />
        </div>
        <h3 className="font-sans font-bold text-base text-brand-text-primary mb-1">Support</h3>
        <p className="font-sans text-sm text-brand-text-secondary mb-4">
          For issues with your profile or information, contact your assigned agent or the Hashmar
          support team.
        </p>

        <div className="space-y-3 mb-5">
          <p className="flex items-center gap-2 font-sans text-sm text-brand-text-primary">
            <User size={16} className="text-brand-green shrink-0" />
            <span>
              <span className="font-semibold">Assigned Agent:</span>{" "}
              {loading ? "Loading..." : agentName || "Unavailable"}
            </span>
          </p>
          <p className="flex items-center gap-2 font-sans text-sm text-brand-text-primary">
            <Phone size={16} className="text-brand-green shrink-0" />
            <span>
              <span className="font-semibold">Support Phone:</span> {supportPhone}
            </span>
          </p>
          <p className="flex items-center gap-2 font-sans text-sm text-brand-text-primary">
            <Mail size={16} className="text-brand-green shrink-0" />
            <span>
              <span className="font-semibold">Support Email:</span> {supportEmail}
            </span>
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 font-sans text-xs text-amber-700">
            {error}
          </p>
        )}

        <a
          href={`tel:${supportPhone}`}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-brand-green text-white font-sans font-semibold text-sm hover:bg-brand-green-dark transition-colors"
        >
          <Phone size={16} /> Call Support
        </a>
      </div>
    </div>
  );
}

export default function FarmerSettings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("faq");
  const [agentName, setAgentName] = useState("");
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    let active = true;
    getFarmerIdCard()
      .then((payload) => {
        if (!active) return;
        setAgentName(payload?.agent_name || "");
        setContactError("");
      })
      .catch((fetchError) => {
        if (!active) return;
        setAgentName("");
        setContactError(
          fetchError instanceof Error
            ? fetchError.message
            : "Assigned agent details are unavailable right now."
        );
      })
      .finally(() => {
        if (active) setLoadingAgent(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="md:hidden page-container">
        <div className="flex-1 px-4 pt-5 pb-10 overflow-y-auto scrollbar-hide">
          <button
            onClick={() => navigate("/farmer/home")}
            className="flex items-center gap-2 text-brand-text-secondary mb-5"
          >
            <ArrowLeft size={18} />
            <span className="font-sans text-sm">Go back</span>
          </button>

          <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1 shadow-sm">
            {[["faq", "FAQs"], ["contact", "Contact"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-xl font-sans font-semibold text-sm transition-all ${
                  tab === key ? "bg-brand-green text-white" : "text-brand-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "faq" && (
            <>
              <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-1">
                Frequently asked questions
              </h1>
              <p className="font-sans text-xs text-brand-text-secondary mb-5">
                If you notice any mistake in your details, please contact your assigned agent or
                Hashmar support.
              </p>
              <FAQContent />
            </>
          )}
          {tab === "contact" && (
            <>
              <h1 className="font-display font-bold text-2xl text-brand-text-primary mb-1">
                General Support
              </h1>
              <p className="font-sans text-xs text-brand-text-secondary mb-5">
                Reach your assigned agent when available, or contact Hashmar support directly.
              </p>
              <ContactContent agentName={agentName} loading={loadingAgent} error={contactError} />
            </>
          )}
        </div>
      </div>

      <FarmerDesktopLayout activeNav="Home" islandContent edgeToEdge>
        <button
          onClick={() => navigate("/farmer/home")}
          className="flex items-center gap-2 text-brand-text-secondary mb-4 hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-sans text-sm">Go back</span>
        </button>

        <div className="flex gap-2 mb-6 border-b border-brand-border pb-0">
          {[["faq", "Frequently asked questions"], ["contact", "General Support"]].map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`font-sans font-semibold text-sm pb-3 border-b-2 transition-all px-1 ${
                  tab === key
                    ? "border-brand-green text-brand-green"
                    : "border-transparent text-brand-text-secondary hover:text-brand-text-primary"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {tab === "faq" && (
          <>
            <p className="font-sans text-sm text-brand-text-secondary mb-5">
              If you notice any mistake in your details, please contact your assigned agent or
              Hashmar support.
            </p>
            <div className="max-w-2xl space-y-3">
              <FAQContent />
            </div>
          </>
        )}
        {tab === "contact" && (
          <>
            <p className="font-sans text-sm text-brand-text-secondary mb-5">
              Reach your assigned agent when available, or contact Hashmar support directly.
            </p>
            <ContactContent agentName={agentName} loading={loadingAgent} error={contactError} />
          </>
        )}
      </FarmerDesktopLayout>
    </>
  );
}
