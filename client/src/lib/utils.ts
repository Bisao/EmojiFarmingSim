import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function requestFullscreen() {
  const doc = document.documentElement;
  
  try {
    if (doc.requestFullscreen) {
      doc.requestFullscreen();
    } else if ((doc as any).webkitRequestFullscreen) {
      (doc as any).webkitRequestFullscreen();
    } else if ((doc as any).msRequestFullscreen) {
      (doc as any).msRequestFullscreen();
    }
  } catch (error) {
    console.warn('Fullscreen not supported:', error);
  }
}

export function requestRotation() {
  if ('screen' in window && 'orientation' in window.screen) {
    window.screen.orientation.lock('landscape')
      .catch(() => {
        // Silently handle rejection
      });
  }
}
