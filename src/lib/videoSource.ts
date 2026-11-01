import type { Title } from '@/lib/types';

export interface VideoSource {
  url: string;
  label: string;
  heading: string;
}

export function titleTrailerSource(title: Title): VideoSource {
  return {
    url: title.trailer_url,
    label: `${title.title} trailer`,
    heading: `Trailer: ${title.title}`,
  };
}
