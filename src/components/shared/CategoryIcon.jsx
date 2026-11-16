const PATHS = {
  MEDICINA: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  DEPORTES: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m12 4 3 6-3 10-3-10z" />
    </>
  ),
  BELLEZA: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
    </>
  ),
  ROPA: (
    <path d="m8 4 4 3 4-3 3 3-3 4v9H8v-9L5 7z" />
  ),
  TECNOLOGIA: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  MANUALIDADES: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.5 15.5M14.5 14.5 20 20" />
    </>
  ),
  JUGUETES: (
    <>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s4 1 6 1c2 0 6 2 6-1s-4-3-6 1z" />
    </>
  ),
  AUTOMOTRIZ: (
    <>
      <path d="M5 11l1.5-5h11L19 11M3 11h18v6H3z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
};

export default function CategoryIcon({ category, size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[category] || PATHS.TECNOLOGIA}
    </svg>
  );
}
