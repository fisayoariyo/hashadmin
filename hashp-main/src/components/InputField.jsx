// Reusable input field — FWMCOMPinputfield design
// Label above, rounded white input with border, placeholder text

export default function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode,
  required = false,
  disabled = false,
  error,
  prefix,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-sans text-sm font-medium text-brand-text-primary">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={`flex items-center bg-white border rounded-2xl px-4 transition-all focus-within:ring-2 focus-within:ring-brand-green focus-within:border-transparent ${
          error ? "border-red-400" : "border-brand-border"
        } ${disabled ? "opacity-60 bg-gray-50" : ""}`}
      >
        {prefix && (
          <>
            <span className="font-sans text-sm text-brand-text-secondary shrink-0 pr-3">
              {prefix}
            </span>
            <div className="w-px h-5 bg-brand-border mr-3 shrink-0" />
          </>
        )}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 py-3.5 bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none"
        />
      </div>
      {error && (
        <p className="font-sans text-xs text-red-500 ml-1">{error}</p>
      )}
    </div>
  );
}
