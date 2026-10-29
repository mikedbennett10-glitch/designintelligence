/** Simple monochrome linework icons -- stroke only, no fill, inherits color via currentColor. */

export function UserCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" />
      <circle cx="12" cy="10" r="3.25" />
      <path d="M5.5 18.3c1.2-2.6 3.6-4 6.5-4s5.3 1.4 6.5 4" />
    </svg>
  );
}

export function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 10.5a6 6 0 1 1 12 0c0 3 1 4.8 1.6 5.7.3.4 0 1-.5 1H4.9c-.5 0-.8-.6-.5-1C5 15.3 6 13.5 6 10.5Z" />
      <path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}
