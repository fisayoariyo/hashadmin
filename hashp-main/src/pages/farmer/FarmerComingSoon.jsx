import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FarmerDesktopLayout from "../../components/farmer/FarmerDesktopLayout";

const PAGES = {
  "/farmer/loans": {
    title: "Access loans",
    subtitle: "Soon, you will be able to get loans to support your farming.",
    caption: "Use your Farmer ID to apply for loans for seeds, tools, and other farming needs.",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=700&q=80",
  },
  "/farmer/support": {
    title: "Get farm support",
    subtitle: "Expert help for your farming is coming soon.",
    caption: "You will receive tips, training, and guidance to help you improve your farm.",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=80",
  },
  "/farmer/buyers": {
    title: "Connect to buyers",
    subtitle: "Find better markets for your produce.",
    caption: "Soon, you will be able to connect with buyers and sell your crops more easily.",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=700&q=80",
  },
};

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center bg-brand-amber text-white text-xs font-semibold font-sans px-3 py-1 rounded-full">
      Coming soon
    </span>
  );
}

export default function FarmerComingSoon() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const page = PAGES[pathname] ?? PAGES["/farmer/loans"];

  const Content = () => (
    <div className="max-w-sm">
      {/* Title + badge */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-display font-bold text-2xl text-brand-text-primary">{page.title}</h1>
        <ComingSoonBadge />
      </div>
      <p className="font-sans text-sm text-brand-text-secondary mb-5">{page.subtitle}</p>

      {/* Image */}
      <div className="rounded-2xl overflow-hidden mb-5 aspect-[4/3]">
        <img
          src={page.image}
          alt={page.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Caption */}
      <p className="font-display font-bold text-base text-brand-green leading-snug mb-5">
        {page.caption}
      </p>

      {/* Disabled button */}
      <button
        disabled
        className="w-full py-3.5 rounded-2xl bg-gray-100 text-brand-text-muted font-sans font-semibold text-sm cursor-not-allowed"
      >
        Coming soon
      </button>
    </div>
  );

  return (
    <>
      {/* ── MOBILE ─────────────────────────────── */}
      <div className="md:hidden page-container">
        <div className="flex-1 px-4 pt-5 pb-10 overflow-y-auto scrollbar-hide">
          <button
            onClick={() => navigate("/farmer/home")}
            className="flex items-center gap-2 text-brand-text-secondary mb-5"
          >
            <ArrowLeft size={18} />
            <span className="font-sans text-sm">Go back</span>
          </button>
          <Content />
        </div>
      </div>

      {/* ── DESKTOP (FWDHP06/07/08) ────────────── */}
      <FarmerDesktopLayout activeNav="Home" islandContent edgeToEdge>
        <button
          onClick={() => navigate("/farmer/home")}
          className="flex items-center gap-2 text-brand-text-secondary mb-4 hover:text-brand-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="font-sans text-sm">Go back</span>
        </button>
        <Content />
      </FarmerDesktopLayout>
    </>
  );
}
