"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function StatsCounter({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: StatsCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * Real App Sovereignty Metrics for Kanri
 * Strictly verified data from GitHub release infrastructure and open-source codebase.
 */
export const KANRI_REAL_STATS = [
  {
    label: "GitHub Release Downloads",
    value: 841,
    suffix: "+",
    decimals: 0,
    duration: 1.8,
    desc: "Direct APK downloads verified via GitHub Releases API",
    tag: "VERIFIED GITHUB API",
  },
  {
    label: "Supported Bank & UPI Formats",
    value: 40,
    suffix: "+",
    decimals: 0,
    duration: 1.5,
    desc: "Custom-tuned regex patterns across major Indian institutions",
    tag: "100% ON-DEVICE PARSED",
  },
  {
    label: "DotTiles Home Widgets",
    value: 12,
    suffix: "",
    decimals: 0,
    duration: 1.2,
    desc: "Tactile dot-matrix widgets rendered via shared Canvas engine",
    tag: "ZERO BATTERY DRAIN",
  },
  {
    label: "Third-Party Trackers & Ads",
    value: 0,
    suffix: "",
    decimals: 0,
    duration: 0.8,
    desc: "Zero telemetry SDKs, zero cloud tracking, zero remote servers",
    tag: "ABSOLUTE AIRGAP",
  },
  {
    label: "SQLCipher AES Encryption",
    value: 256,
    suffix: "-bit",
    decimals: 0,
    duration: 1.5,
    desc: "Database encrypted at rest with Android Keystore hardware keys",
    tag: "HARDWARE TEE SEALED",
  },
  {
    label: "Financial Visualizers",
    value: 18,
    suffix: "+",
    decimals: 0,
    duration: 1.4,
    desc: "GitHub-style heatmaps, burn-rate trends, and 0–100 health score",
    tag: "CLIENT-SIDE COMPUTED",
  },
];

export function KanriStatsGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {KANRI_REAL_STATS.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[#111114] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 hover:border-white/20 hover:-translate-y-0.5"
        >
          <div className="flex items-baseline gap-1">
            <StatsCounter
              value={stat.value}
              suffix={stat.suffix}
              decimals={stat.decimals}
              duration={stat.duration}
              className="font-mono text-3xl lg:text-4xl font-bold text-white tracking-tight"
            />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">{stat.label}</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">{stat.desc}</p>
          </div>
          <div className="pt-3 border-t border-white/5">
            <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
              {stat.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
