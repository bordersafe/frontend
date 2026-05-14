"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { signOut } from "firebase/auth";
import useSWR from "swr";
import { useAuthedApi } from "@/lib/api/auth-client";
import { firebaseAuth } from "@/lib/firebase";

type NavItem = {
  label: string;
  href: string;
  description: string;
};

type PageMeta = {
  title: string;
  description: string;
};

type UserProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    description: "",
  },
  {
    label: "Escrows",
    href: "/escrow",
    description: "",
  },
  {
    label: "Reviews",
    href: "/admin",
    description: "",
  },
  {
    label: "Wallet",
    href: "/wallet",
    description: "",
  },
  {
    label: "Stores",
    href: "/dashboard/stores",
    description: "",
  },
];

const IconGrid = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M4 4h7v7H4V4Zm9 0h7v7h-7V4Zm-9 9h7v7H4v-7Zm9 0h7v7h-7v-7Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);

const IconLock = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M7 10V7a5 5 0 0 1 10 0v3"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <rect x="5" y="10" width="14" height="10" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconEye = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconWallet = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M4 7h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M4 7V6a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="16.5" cy="12.5" r="1.5" fill="currentColor" />
  </svg>
);

const IconStore = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M4 9 6.5 4h11L20 9M5 9v10h14V9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 19v-6h6v6" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconUser = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconSearch = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
    <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconBell = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path
      d="M6 9a6 6 0 1 1 12 0c0 5 2 5 2 7H4c0-2 2-2 2-7Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconSpark = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconChevronLeft = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevronRight = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
    <path d="m10 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NAV_ICONS = [IconGrid, IconLock, IconEye, IconWallet, IconStore];

function resolvePageMeta(pathname: string): PageMeta {
  if (pathname.startsWith("/escrow/new")) {
    return {
      title: "Create escrow",
      description: "",
    };
  }
  if (pathname.startsWith("/escrow/") && pathname !== "/escrow") {
    return {
      title: "Escrow detail",
      description: "",
    };
  }
  if (pathname.startsWith("/escrow")) {
    return {
      title: "Escrows",
      description: "",
    };
  }
  if (pathname.startsWith("/wallet/send-money")) {
    return {
      title: "Send money",
      description: "",
    };
  }
  if (pathname.startsWith("/wallet/cardless")) {
    return {
      title: "Cardless paycode",
      description: "",
    };
  }
  if (pathname.startsWith("/wallet/vas")) {
    return {
      title: "VAS purchases",
      description: "",
    };
  }
  if (pathname.startsWith("/wallet")) {
    return {
      title: "Wallet",
      description: "",
    };
  }
  if (pathname.startsWith("/admin")) {
    return {
      title: "Human review",
      description: "",
    };
  }
  if (pathname.startsWith("/dashboard/stores")) {
    return {
      title: "Stores",
      description: "",
    };
  }
  return {
    title: "Operations studio",
    description: "",
  };
}

export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthLoading, get } = useAuthedApi();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("border-safe-sidebar-collapsed");
    if (storedValue) {
      setIsSidebarCollapsed(storedValue === "1");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("border-safe-sidebar-collapsed", isSidebarCollapsed ? "1" : "0");
  }, [isSidebarCollapsed]);

  const { data: profile } = useSWR<UserProfile>(
    isAuthLoading || !user ? null : ["/api/auth/me", user.uid],
    async () => get<UserProfile>("/api/auth/me"),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const activeMeta = useMemo(() => resolvePageMeta(pathname ?? "/"), [pathname]);
  const visibleNavItems = useMemo(() => {
    const roles = profile?.roles ?? [];

    return NAV_ITEMS.map((item, index) => ({ ...item, icon: NAV_ICONS[index] ?? IconGrid }))
      .filter((item) => {
        if (item.href === "/admin") {
          return roles.some((role) => ["admin", "super_admin", "hitl"].includes(role));
        }
        if (item.href === "/dashboard/stores") {
          return roles.some((role) => ["vendor", "admin", "super_admin"].includes(role));
        }
        return !!profile || item.href === "/dashboard";
      });
  }, [profile]);

  const activeItem = useMemo(() => {
    return visibleNavItems.find((item) => {
      if (item.href === "/dashboard") {
        return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
      }
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    });
  }, [pathname, visibleNavItems]);

  return (
    <div
      className="relative min-h-dvh bg-(--canvas)"
      data-sidebar-collapsed={isSidebarCollapsed ? "true" : "false"}
    >
      <div className="absolute inset-0 surface-grid opacity-60" />

      <aside className="fixed inset-y-4 left-4 z-40 hidden w-(--sidebar-width) flex-col overflow-hidden rounded-[32px] border border-white/60 bg-white/70 pb-6 pt-8 shadow-(--shell-shadow) backdrop-blur transition-[width] duration-300 ease-out lg:flex">
        <button
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-8 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/95 text-(--ink-muted) shadow-(--card-shadow)"
          type="button"
          onClick={() => setIsSidebarCollapsed((value) => !value)}
        >
          {isSidebarCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>

        <div className={`flex items-center gap-3 px-6 ${isSidebarCollapsed ? "justify-center px-4" : ""}`}>
          <Image
            alt="BorderSafe logo"
            className="h-12 w-12 rounded-[18px] object-cover"
            src="/images/logo.svg"
            width={48}
            height={48}
          />
          {!isSidebarCollapsed && (
            <div>
              <p className="text-sm font-semibold text-foreground">BorderSafe</p>
            </div>
          )}
        </div>

        <div className="px-6">
          {isSidebarCollapsed ? (
            <div className="mt-6 flex items-center justify-center rounded-3xl border border-white/70 bg-white/75 p-3 text-(--ink-muted)">
              <IconUser className="h-4 w-4" />
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-white/70 bg-white/75 p-4 text-xs text-(--ink-muted)">
              <p className="text-[10px] uppercase tracking-[0.3em] text-(--ink-soft)">Account</p>
              <p className="mt-3 text-sm text-foreground">{profile?.display_name ?? "Anonymous"}</p>
              <p className="mt-1 text-xs text-(--ink-soft)">{(profile?.roles ?? ["guest"]).join(", ")}</p>
              <Link className="mt-4 inline-flex text-xs font-semibold text-foreground" href="/auth">
                Switch account
              </Link>
            </div>
          )}
        </div>

        <nav className="mt-8 flex-1 px-4">
          <div className="space-y-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/dashboard"
                  ? pathname.startsWith("/dashboard")
                  : pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.label}
                  className={`group flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} rounded-[18px] border px-4 py-3 text-sm transition ${
                    isActive
                      ? "border-(--action) bg-(--action) text-(--action-ink)"
                      : "border-white/70 bg-white/80 text-(--ink-muted) hover:border-(--action) hover:text-foreground"
                  }`}
                  href={item.href}
                >
                  <span className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
                    <Icon className={`${isActive ? "text-(--action-ink)" : "text-(--ink-muted)"} h-3.5 w-3.5 shrink-0`} />
                    {!isSidebarCollapsed && (
                      <span className="flex flex-col text-left">
                        <span className="text-sm font-semibold">{item.label}</span>
                        {item.description && (
                          <span className={isActive ? "text-xs text-(--action-ink-dim)" : "text-xs text-(--ink-soft)"}>
                            {item.description}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                  {!isSidebarCollapsed && (
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-(--accent-warm)" : "bg-(--border-soft)"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-4">
          <div className={isSidebarCollapsed ? "rounded-3xl border border-white/70 bg-white/85 p-3" : "rounded-3xl border border-white/70 bg-white/85 p-4"}>
            <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "gap-3"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-alt) text-xs font-semibold text-(--ink-muted)">
                {profile?.display_name ? profile.display_name.split(" ")[0].slice(0,2).toUpperCase() : "--"}
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <p className="text-sm font-semibold text-foreground">{profile?.display_name ?? "Anonymous"}</p>
                  <p className="text-xs text-(--ink-muted)">{(profile?.roles ?? ["guest"]).join(", ")}</p>
                </div>
              )}
            </div>
            <button
              className={`mt-4 flex w-full items-center justify-center rounded-[18px] border border-white/70 bg-white/80 px-3 py-2 text-xs text-foreground ${isSidebarCollapsed ? "gap-0" : "gap-2"}`}
              type="button"
              onClick={async () => {
                try {
                  await signOut(firebaseAuth);
                  router.push("/auth");
                } catch {
                  router.push("/auth");
                }
              }}
            >
              {isSidebarCollapsed ? <IconChevronLeft className="h-3.5 w-3.5 rotate-180" /> : <span>Sign out</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col lg:pl-(--sidebar-width)">
        <header className="sticky top-0 z-30 px-4 pt-4 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-6 shadow-(--card-shadow) backdrop-blur">
            <div className="absolute inset-0 section-loom" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="heading-1">{activeMeta.title}</h1>
                {activeItem && activeItem.description && <p className="text-xs text-(--ink-soft)">{activeItem.description}</p>}
              </div>

              <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:flex-nowrap sm:justify-end">
                <div className="relative w-full sm:max-w-[320px]">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--ink-soft)">
                    <IconSearch className="h-4 w-4" />
                  </span>
                  <input
                    className="w-full rounded-full border border-white/70 bg-white/90 py-2 pl-9 pr-4 text-sm text-foreground outline-none"
                    placeholder="Search escrows, buyers, sellers"
                    type="search"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-(--ink-muted)"
                    type="button"
                    aria-label="Notifications"
                  >
                    <IconBell className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-(--ink-muted)"
                    type="button"
                    aria-label="Insights"
                  >
                    <IconSpark className="h-4 w-4" />
                  </button>
                  <Link
                    className="rounded-full bg-(--action) px-4 py-2 text-xs font-semibold text-(--action-ink)"
                    href="/escrow/new"
                  >
                    New escrow
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {NAV_ITEMS.map((item, index) => {
                const Icon = NAV_ICONS[index] ?? IconGrid;
                return (
                  <Link
                    key={item.label}
                    className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-(--ink-muted)"
                    href={item.href}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 pb-10 pt-6 sm:px-8 lg:px-12">{children}</div>
      </div>
    </div>
  );
}
