import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalize(str?: string) {
  return (str ?? "").trim().toLowerCase()
}

export function toTitleCase(str?: string) {
  return normalize(str).replace(/\b\w/g, (c) => c.toUpperCase())
}
