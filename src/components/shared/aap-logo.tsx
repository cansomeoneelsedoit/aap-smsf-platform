export function AapLogo({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z"
        fill="#fef3ee"
        stroke="#e8591a"
        strokeWidth="1.5"
      />
      <circle cx="18" cy="18" r="2.5" fill="#e8591a" />
      <path
        d="M18 8v8M10 14l6.5 3M26 14l-6.5 3"
        stroke="#e8591a"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
