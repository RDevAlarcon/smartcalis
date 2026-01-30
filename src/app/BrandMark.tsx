"use client";

import { usePathname } from "next/navigation";

export default function BrandMark() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div className="pointer-events-none absolute left-6 top-6 z-10 text-xs font-semibold uppercase tracking-[0.45em] text-sky-200">
      SmartCalis
    </div>
  );
}