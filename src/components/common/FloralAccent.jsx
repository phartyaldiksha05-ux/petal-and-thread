import React from 'react';

/**
 * Delicate floral and needle-thread decorative botanical accents
 */
export function FloralAccent({ className = "w-6 h-6 text-rose/60", type = "sprig" }) {
  if (type === "needle") {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Curved thread */}
        <path d="M6 34C14 42 22 36 28 26C34 16 38 12 42 10" strokeDasharray="3 3" opacity="0.7" />
        {/* Needle */}
        <path d="M41 7L36 12M41 7L38 4L32 10L14 28L12 36L20 34L38 16L44 10L41 7Z" />
        <circle cx="39" cy="9" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (type === "blossom") {
    return (
      <svg
        className={className}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="3" fill="#B77B83" opacity="0.6" />
        <path
          d="M16 13C16 9 12 8 12 11C12 13 15 15 16 16M19 16C23 16 24 12 21 12C19 12 17 15 16 16M16 19C16 23 20 24 20 21C20 19 17 17 16 16M13 16C9 16 8 20 11 20C13 20 15 17 16 16M16 13C19 9 23 11 21 14C19 16 17 16 16 16"
          stroke="#B77B83"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Default delicate sprig
  return (
    <svg
      className={className}
      viewBox="0 0 60 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 10C20 10 30 10 58 10" opacity="0.4" />
      <path d="M18 10C16 6 12 6 11 8C10 10 14 10 18 10Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M26 10C28 14 32 14 33 12C34 10 30 10 26 10Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M38 10C36 6 32 6 31 8C30 10 34 10 38 10Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M46 10C48 14 52 14 53 12C54 10 50 10 46 10Z" fill="currentColor" fillOpacity="0.15" />
      <circle cx="30" cy="10" r="2.5" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}
