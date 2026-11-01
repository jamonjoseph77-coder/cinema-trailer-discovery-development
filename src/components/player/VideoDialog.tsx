import { Modal } from '@/components/ui/Modal';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { isDirectVideoUrl, toEmbedUrl } from '@/lib/media';
import type { VideoSource } from '@/lib/videoSource';

interface VideoDialogProps extends VideoSource {
  onClose: () => void;
}

export function VideoDialog({ url, label, heading, onClose }: VideoDialogProps) {
  const direct = isDirectVideoUrl(url);
  const embedUrl = direct ? null : toEmbedUrl(url);

  return (
    <Modal label={label} onClose={onClose} wide>
      <div className="space-y-4 pr-8">
        <p className="text-sm font-semibold text-slate-300">{heading}</p>
        {direct && <VideoPlayer src={url} title={label} />}
        {embedUrl && (
          <div className="aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            <iframe
              src={embedUrl}
              title={label}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
        {!direct && !embedUrl && (
          <p className="rounded-xl border border-white/10 bg-ink-850 p-4 text-sm text-slate-400">
            This video link cannot be played here. Ask an administrator to use a direct video link or a YouTube or Vimeo link.
          </p>
        )}
      </div>
    </Modal>
  );
}
