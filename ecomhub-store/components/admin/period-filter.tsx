"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const options = [
  { key: "today", label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "month", label: "Este mês" },
];

export function PeriodFilter() {
  const sp = useSearchParams();
  const current = sp.get("period") ?? "30d";
  return (
    <div className="flex gap-1 bg-muted rounded-md p-1 w-fit">
      {options.map(o => (
        <Link
          key={o.key}
          href={`?period=${o.key}`}
          className={cn(
            "px-3 py-1 text-sm rounded transition-colors",
            current === o.key ? "bg-background shadow-sm font-medium" : "hover:bg-accent"
          )}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
