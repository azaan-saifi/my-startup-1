import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function getAuthStatus(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminAuth') === 'authenticated';
}

export function setAuthStatus(value: boolean): void {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem('adminAuth', 'authenticated');
  } else {
    localStorage.removeItem('adminAuth');
  }
}
