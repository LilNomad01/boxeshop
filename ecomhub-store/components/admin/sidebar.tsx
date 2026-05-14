"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingCart, Package, Plug, LogOut } from "lucide-react";

const items = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Pedidos" },
  { href: "/admin/products", icon: Package, label: "Produtos" },
  { href: "/admin/ecomhub", icon: Plug, label: "EcomHub" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-card p-4 sticky top-0 h-screen">
      <div className="mb-6 px-2">
        <h1 className="text-xl font-bold">EcomHub Store</h1>
        <p className="text-xs text-muted-foreground">Painel administrativo</p>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <a
        href="/api/auth/logout"
        className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </a>
    </aside>
  );
}
