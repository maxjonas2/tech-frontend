import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...args: ClassValue[]) {
  return twMerge(clsx(args));
}

function j2s(json: any) {
  return JSON.stringify(json);
}

function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { cn, j2s, generateRandomId, sleep };
