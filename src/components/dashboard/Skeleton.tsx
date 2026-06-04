/** Reusable skeleton block for loading states. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 8%, transparent), transparent)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite linear",
      }}
    />
  );
}
