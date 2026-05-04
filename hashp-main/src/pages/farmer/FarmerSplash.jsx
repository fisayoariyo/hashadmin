import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { farmerBrandSplash } from "../../mockData/farmer";

/** FWM-CA-01 style — full-bleed field + centered logo (mobile + FWD). */
export default function FarmerSplash() {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      navigate("/farmer/verify", { replace: true });
      return;
    }
    const t = setTimeout(() => navigate("/farmer/verify", { replace: true }), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-black">
      <img
        src={farmerBrandSplash.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
