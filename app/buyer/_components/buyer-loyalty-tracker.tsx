"use client";

import { useState } from "react";

type LifecycleStage = "new" | "active" | "loyal" | "vip" | "dormant";
type MilestoneStatus = "locked" | "in-progress" | "completed";

type Milestone = {
  id: string;
  label: string;
  target: number;
  current: number;
  status: MilestoneStatus;
  icon: string;
  reward: string;
};

export function BuyerLoyaltyTracker() {
  const [selectedStage, setSelectedStage] = useState<LifecycleStage>("active");

  const stages = {
    new: {
      label: "New Buyer",
      description: "Your first steps on VendOpay",
      progressPercent: 25,
      color: "from-blue-400 to-blue-600",
      milestones: [
        {
          id: "first-order",
          label: "First purchase",
          target: 1,
          current: 1,
          status: "completed" as const,
          icon: "🛍️",
          reward: "Welcome Badge",
        },
        {
          id: "first-review",
          label: "Leave your first review",
          target: 1,
          current: 0,
          status: "in-progress" as const,
          icon: "⭐",
          reward: "+10 Trust Points",
        },
        {
          id: "first-seller",
          label: "Buy from 3 different sellers",
          target: 3,
          current: 1,
          status: "in-progress" as const,
          icon: "👥",
          reward: "+25 Trust Points",
        },
        {
          id: "safe-checkout",
          label: "Complete 5 disputes-free orders",
          target: 5,
          current: 3,
          status: "in-progress" as const,
          icon: "✅",
          reward: "Safety Badge",
        },
      ],
    },
    active: {
      label: "Active Buyer",
      description: "Regular purchases and good standing",
      progressPercent: 50,
      color: "from-emerald-400 to-emerald-600",
      milestones: [
        {
          id: "orders-10",
          label: "10 purchases",
          target: 10,
          current: 12,
          status: "completed" as const,
          icon: "🎯",
          reward: "Completed",
        },
        {
          id: "reviews-5",
          label: "5 verified reviews",
          target: 5,
          current: 4,
          status: "in-progress" as const,
          icon: "📝",
          reward: "+50 Trust Points",
        },
        {
          id: "spent-20k",
          label: "Spend ₦20,000",
          target: 20000,
          current: 15000,
          status: "in-progress" as const,
          icon: "💰",
          reward: "Premium Badge",
        },
        {
          id: "disputes-won",
          label: "Win 100% of disputes",
          target: 5,
          current: 5,
          status: "completed" as const,
          icon: "🏆",
          reward: "Trust Champion",
        },
      ],
    },
    loyal: {
      label: "Loyal Buyer",
      description: "High-value customer with excellent record",
      progressPercent: 75,
      color: "from-amber-400 to-amber-600",
      milestones: [
        {
          id: "orders-50",
          label: "50 purchases",
          target: 50,
          current: 45,
          status: "in-progress" as const,
          icon: "🎪",
          reward: "Loyalty Badge",
        },
        {
          id: "followers-10",
          label: "10 saved sellers",
          target: 10,
          current: 7,
          status: "in-progress" as const,
          icon: "📍",
          reward: "Collector Badge",
        },
        {
          id: "trustpoints-500",
          label: "500+ Trust Points",
          target: 500,
          current: 380,
          status: "in-progress" as const,
          icon: "⭐",
          reward: "VIP Unlock",
        },
        {
          id: "referrals-5",
          label: "Refer 5 friends",
          target: 5,
          current: 2,
          status: "in-progress" as const,
          icon: "👫",
          reward: "+100 Trust Points",
        },
      ],
    },
    vip: {
      label: "VIP Buyer",
      description: "Elite status with exclusive benefits",
      progressPercent: 100,
      color: "from-purple-400 to-purple-600",
      milestones: [
        {
          id: "vip-status",
          label: "VIP Status Unlocked",
          target: 1,
          current: 1,
          status: "completed" as const,
          icon: "👑",
          reward: "VIP Badge",
        },
        {
          id: "priority-support",
          label: "Priority support access",
          target: 1,
          current: 1,
          status: "completed" as const,
          icon: "🎧",
          reward: "Active",
        },
        {
          id: "cashback-rewards",
          label: "2% cashback on orders",
          target: 1,
          current: 1,
          status: "completed" as const,
          icon: "💳",
          reward: "Active",
        },
        {
          id: "early-access",
          label: "Early access to deals",
          target: 1,
          current: 1,
          status: "completed" as const,
          icon: "⚡",
          reward: "Active",
        },
      ],
    },
    dormant: {
      label: "Dormant Account",
      description: "Come back and make a purchase!",
      progressPercent: 10,
      color: "from-gray-400 to-gray-600",
      milestones: [
        {
          id: "reactivate",
          label: "Make a purchase",
          target: 1,
          current: 0,
          status: "locked" as const,
          icon: "🔄",
          reward: "Welcome back offer",
        },
        {
          id: "comeback-bonus",
          label: "Get ₦1000 comeback bonus",
          target: 1,
          current: 0,
          status: "locked" as const,
          icon: "🎁",
          reward: "₦1000 credit",
        },
      ],
    },
  };

  const currentStage = stages[selectedStage];
  const stageList = Object.entries(stages).map(([key, val]) => ({
    key: key as LifecycleStage,
    label: val.label,
  }));

  return (
    <section className="panel p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Your Buyer Journey</h2>
        <p className="mt-1 text-sm text-(--ink-soft)">
          Progress through stages and unlock exclusive rewards
        </p>
      </div>

      {/* Stage Timeline */}
      <div className="mt-6 flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {stageList.map((stage, index) => (
          <div key={stage.key} className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setSelectedStage(stage.key)}
              className={`rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                selectedStage === stage.key
                  ? "bg-(--primary) text-white shadow-md"
                  : "bg-slate-100 text-foreground hover:bg-slate-200"
              }`}
            >
              {stage.label}
            </button>
            {index < stageList.length - 1 && (
              <div
                className={`h-1 w-4 shrink-0 ${
                  selectedStage === stage.key || stageList.slice(0, index + 1).some((s) => s.key === selectedStage)
                    ? "bg-(--primary)"
                    : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stage Progress */}
      <div className="mt-8 rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{currentStage.label}</h3>
            <p className="mt-1 text-sm text-white/90">{currentStage.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{currentStage.progressPercent}%</div>
            <p className="text-xs text-white/80 mt-1">Complete</p>
          </div>
        </div>

        <div className="mt-4 h-3 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className={`h-full bg-white transition-all ${currentStage.progressPercent >= 75 ? "w-[75%]" : currentStage.progressPercent >= 50 ? "w-[50%]" : currentStage.progressPercent >= 25 ? "w-[25%]" : "w-[10%]"}`}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="mt-8">
        <h3 className="font-semibold text-foreground">Milestones</h3>
        <div className="mt-4 space-y-3">
          {currentStage.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`rounded-lg border p-4 ${
                milestone.status === "completed"
                  ? "bg-emerald-50 border-emerald-200"
                  : milestone.status === "in-progress"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{milestone.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{milestone.label}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        milestone.status === "completed"
                          ? "bg-emerald-200 text-emerald-800"
                          : milestone.status === "in-progress"
                            ? "bg-blue-200 text-blue-800"
                            : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {milestone.status === "completed"
                        ? "✓ Completed"
                        : milestone.status === "in-progress"
                          ? "In Progress"
                          : "Locked"}
                    </span>
                  </div>

                  {/* Progress bar for in-progress milestones */}
                  {milestone.status === "in-progress" && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white overflow-hidden">
                        <div
                          className={`h-full bg-blue-500 transition-all ${
                            milestone.current / milestone.target >= 0.9
                              ? "w-[90%]"
                              : milestone.current / milestone.target >= 0.7
                                ? "w-[70%]"
                                : milestone.current / milestone.target >= 0.5
                                  ? "w-[50%]"
                                  : milestone.current / milestone.target >= 0.25
                                    ? "w-[25%]"
                                    : "w-[10%]"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-(--ink-muted)">
                        {milestone.current}/{milestone.target}
                      </p>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-(--ink-muted)">
                    <span className="font-semibold">Reward:</span> {milestone.reward}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage Benefits */}
      <div className="mt-8 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-sm font-semibold text-amber-900">
          🎁 Reach the next stage to unlock exclusive benefits and rewards!
        </p>
      </div>
    </section>
  );
}
