const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|mov|m3u8)(\?|#|$)/i;

export function isDirectVideoUrl(url: string): boolean {
  return DIRECT_VIDEO_PATTERN.test(url);
}

export function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|#|$)/i.test(url);
}

export function isHttpUrl(value: string): boolean {
  if (value.trim() === '') return true;
  return /^https?:\/\/\S+$/i.test(value.trim());
}

export function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      if (parsed.pathname.startsWith('/embed/')) return url;
      return null;
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (parsed.hostname.endsWith('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}
