import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Phone, MessageCircle, Mail, User } from "lucide-react";
import BottomNav from "../components/BottomNav";
import EmptyState from "../components/EmptyState";
import { CardSkeleton } from "../components/Skeleton";
import { useHelp } from "../hooks/useHelp";

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      className="card w-full text-left active:scale-[0.99] transition-transform"
      onClick={() => setOpen((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-sans font-semibold text-sm text-brand-text-primary leading-snug">
          {faq.question}
        </p>
        {open ? (
          <ChevronUp size={16} className="text-brand-green shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={16} className="text-brand-text-muted shrink-0 mt-0.5" />
        )}
      </div>
      {open && (
        <p className="font-sans text-sm text-brand-text-secondary mt-3 leading-relaxed border-t border-brand-border pt-3">
          {faq.answer}
        </p>
      )}
    </button>
  );
}

export default function HelpScreen() {
  const navigate = useNavigate();
  const { faqs, supportContact, loading, error, refetch } = useHelp();

  const contacts = supportContact
    ? [
        {
          label: "Support Line",
          value: supportContact.phone,
          icon: Phone,
          action: `tel:${supportContact.phone}`,
        },
        {
          label: "WhatsApp",
          value: "Chat with us",
          icon: MessageCircle,
          action: supportContact.whatsapp,
        },
        {
          label: "Email",
          value: supportContact.email,
          icon: Mail,
          action: `mailto:${supportContact.email}`,
        },
        {
          label: "Field Agent",
          value: supportContact.fieldAgent,
          icon: User,
          action: null,
        },
      ]
    : [];

  return (
    <div className="page-container">
      <div className="page-content">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-text-secondary mb-4 pt-2"
        >
          <ArrowLeft size={18} />
          <span className="font-sans text-sm">Back</span>
        </button>

        <h1 className="font-display font-bold text-xl text-brand-text-primary mb-6">
          Help & Support
        </h1>

        <h2 className="font-display font-bold text-lg text-brand-text-primary mb-3">
          Frequently Asked Questions
        </h2>

        {loading && (
          <div className="space-y-3 mb-8">
            {[1, 2, 3].map((i) => (
              <CardSkeleton key={i} rows={1} />
            ))}
          </div>
        )}

        {error && (
          <EmptyState
            emoji="⚠️"
            title="Could not load help content"
            subtitle={error}
            action={
              <button
                onClick={refetch}
                className="text-brand-green font-semibold text-sm"
              >
                Try again
              </button>
            }
          />
        )}

        {!loading && !error && (
          <>
            <div className="space-y-3 mb-8">
              {faqs.map((faq) => (
                <FAQItem key={faq.id} faq={faq} />
              ))}
            </div>

            <h2 className="font-display font-bold text-lg text-brand-text-primary mb-3">
              Contact Support
            </h2>
            <div className="space-y-3">
              {contacts.map(({ label, value, icon: Icon, action }) => {
                const Tag = action ? "a" : "div";
                return (
                  <Tag
                    key={label}
                    href={action || undefined}
                    target={action?.startsWith("http") ? "_blank" : undefined}
                    rel={action?.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="card flex items-center gap-3 active:scale-[0.99] transition-transform"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-green-muted flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-brand-green" />
                    </div>
                    <div>
                      <p className="label-sm">{label}</p>
                      <p className="font-sans text-sm font-semibold text-brand-text-primary">
                        {value}
                      </p>
                    </div>
                  </Tag>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
