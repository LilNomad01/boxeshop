import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-red-100 text-red-800",
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-yellow-100 text-yellow-800",
        info: "border-transparent bg-blue-100 text-blue-800",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps["variant"]; label: string }> = {
    pending: { variant: "warning", label: "Pendente" },
    paid: { variant: "info", label: "Pago" },
    shipped: { variant: "info", label: "Enviado" },
    delivered: { variant: "success", label: "Entregue" },
    cancelled: { variant: "destructive", label: "Cancelado" },
    refunded: { variant: "secondary", label: "Reembolsado" },
    synced: { variant: "success", label: "Sincronizado" },
    failed: { variant: "destructive", label: "Erro" },
    pending_ecomhub_sync: { variant: "warning", label: "Aguarda retry" },
  };
  const config = map[status] ?? { variant: "outline", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
