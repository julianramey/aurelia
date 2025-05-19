import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | string | undefined): string {
  if (num === undefined || num === null) return '0';
  const value = typeof num === 'string' ? parseFloat(num.toString().replace(/,/g, '')) : num;
  if (isNaN(value)) return '0';
  if (value >= 1000000000) return (value / 1000000000).toFixed(1).replace(/\\.0$/, '') + 'B';
  if (value >= 1000000) return (value / 1000000).toFixed(1).replace(/\\.0$/, '') + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1).replace(/\\.0$/, '') + 'K';
  return value.toLocaleString();
}

export function getSocialIcon(platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'linkedin' | 'pinterest' | 'website' | 'email' | string | undefined) {
  // ... existing code ...
}
