import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "RON") {
  return new Intl.NumberFormat("ro-RO", { style: "currency", currency }).format(value);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "short", timeStyle: "short",
  }).format(new Date(date));
}
