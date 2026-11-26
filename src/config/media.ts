const RAW_MEDIA_BASE_URL = (import.meta.env.VITE_MEDIA_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '');

export const MEDIA_BASE_URL = RAW_MEDIA_BASE_URL;

// Inject <link rel="preconnect"> once when an external media origin is configured
if (typeof document !== 'undefined' && RAW_MEDIA_BASE_URL) {
  try {
    const origin = new URL(RAW_MEDIA_BASE_URL).origin;
    if (!document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  } catch {
    // Ignore invalid URL strings; mediaUrl will still concatenate safely
  }
}

/**
 * Resolves a media asset URL to Cloudflare R2 (or CDN/Worker) when
 * `VITE_MEDIA_BASE_URL` is configured, falling back to the local `public/`
 * path when unset.
 */
export function mediaUrl(r2Path: string, localPath: string): string {
  if (!RAW_MEDIA_BASE_URL) {
    return localPath;
  }
  const cleanR2Path = r2Path.replace(/^\/+/, '');
  return `${RAW_MEDIA_BASE_URL}/${cleanR2Path}`;
}
