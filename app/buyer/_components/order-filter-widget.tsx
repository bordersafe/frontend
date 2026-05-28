"use client";

import { useState } from "react";

type FilterState = "all" | "active" | "recent" | "disputed";

export function OrderFilterWidget({ 
  activeOrdersCount, 
  recentOrdersCount,
  onFilterChange,
}: { 
  activeOrdersCount: number;
  recentOrdersCount: number;
  onFilterChange: (filter: FilterState) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterState>("all");

  const filters: Array<{ id: FilterState; label: string; count: number; icon: string }> = [
    { id: "all", label: "All Orders", count: activeOrdersCount + recentOrdersCount, icon: "📋" },
    { id: "active", label: "Active", count: activeOrdersCount, icon: "⏳" },
    { id: "recent", label: "Recent", count: recentOrdersCount, icon: "✅" },
    { id: "disputed", label: "Disputes", count: 0, icon: "⚠️" },
  ];

  const handleFilterClick = (filter: FilterState) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            activeFilter === filter.id
              ? "bg-(--primary) text-white shadow-md"
              : "bg-white border border-(--border-soft) text-(--ink-strong) hover:border-(--primary)"
          }`}
        >
          <span>{filter.icon}</span>
          <span>{filter.label}</span>
          {filter.count > 0 && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeFilter === filter.id ? "bg-white/30" : "bg-(--primary)/10 text-(--primary)"
            }`}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
