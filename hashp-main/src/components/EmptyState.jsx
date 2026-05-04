export default function EmptyState({ emoji = "🌱", title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-5xl mb-4 select-none">{emoji}</span>
      {title && (
        <h3 className="font-display font-bold text-lg text-brand-text-primary mb-1">
          {title}
        </h3>
      )}
      {subtitle && (
        <p className="font-sans text-sm text-brand-text-secondary leading-relaxed max-w-xs">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
