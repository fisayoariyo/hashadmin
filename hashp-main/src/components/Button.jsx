// Reusable button — FWMCOMPbuttons design
// Variants: amber (primary CTA), green (brand), outline (secondary), dark (neutral)

const variants = {
  amber:
    "bg-brand-amber text-white active:brightness-90",
  green:
    "bg-brand-green text-white active:brightness-90",
  outline:
    "bg-white border-2 border-brand-green text-brand-green active:bg-brand-green-muted",
  dark:
    "bg-brand-text-primary text-white active:brightness-90",
};

export default function Button({
  children,
  variant = "green",
  onClick,
  disabled = false,
  fullWidth = true,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? "w-full" : ""} font-display font-semibold text-base py-4 px-6 rounded-3xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
