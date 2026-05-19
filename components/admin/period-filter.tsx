"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const options = [
  { key: "today", label: "Hoje" },
  { key: "yesterday", label: "Ontem" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "month", label: "Este mês" },
];

export function PeriodFilter() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const current = sp.get("period") ?? "30d";

  function select(key: string) {
    if (key === current) return;
    const params = new URLSearchParams(sp.toString());
    params.set("period", key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 bg-muted rounded-md p-1 w-fit">
        {options.map(o => (
          <button
            key={o.key}
            onClick={() => select(o.key)}
            disabled={isPending}
            className={cn(
              "px-3 py-1 text-sm rounded transition-colors disabled:opacity-60",
              current === o.key ? "bg-background shadow-sm font-medium" : "hover:bg-accent"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
