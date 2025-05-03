
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function requestFullscreen() {
  const doc = document.documentElement;
  
  if (!document.fullscreenEnabled) {
    console.warn('Fullscreen is not supported in this environment');
    return;
  }
  
  try {
    if (doc.requestFullscreen) {
      doc.requestFullscreen().catch(err => {
        console.warn('Failed to enter fullscreen:', err);
      });
    } else if ((doc as any).webkitRequestFullscreen) {
      (doc as any).webkitRequestFullscreen().catch(err => {
        console.warn('Failed to enter fullscreen:', err);
      });
    } else if ((doc as any).msRequestFullscreen) {
      (doc as any).msRequestFullscreen().catch(err => {
        console.warn('Failed to enter fullscreen:', err);
      });
    }
  } catch (error) {
    console.warn('Fullscreen request failed:', error);
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
