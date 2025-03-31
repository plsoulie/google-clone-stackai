import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname + parsedUrl.pathname;
  } catch (error) {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`;
  } catch (error) {
    return "";
  }
}

export function formatCompactNumber(number: number): string {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(number);
}
