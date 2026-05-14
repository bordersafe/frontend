"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

import { StudioShell } from "@/app/_components/studio-shell";

const STUDIO_PREFIXES = ["/dashboard", "/escrow", "/wallet", "/admin"];

type ShellBoundaryProps = {
  children: ReactNode;
};

export function ShellBoundary({ children }: ShellBoundaryProps) {
  const pathname = usePathname() ?? "/";
  const isStudioRoute = STUDIO_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isStudioRoute) {
    return <div className="relative mx-auto min-h-dvh w-full">{children}</div>;
  }

  return <StudioShell>{children}</StudioShell>;
}
