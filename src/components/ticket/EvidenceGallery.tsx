import { Play, ImageIcon, ExternalLink } from 'lucide-react';

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function getYouTubeEmbedUrl(url: string): string | null {
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/([\w-]{11}))/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function EvidenceGallery({ proof }: { proof: string }) {
  const urls = proof
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  if (urls.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {urls.map((url, idx) => {
        if (isYouTubeUrl(url)) {
          const embedUrl = getYouTubeEmbedUrl(url);
          if (embedUrl) {
            return (
              <div
                key={idx}
                className="border-border group relative aspect-video overflow-hidden rounded-xl border shadow-sm"
              >
                <iframe
                  src={embedUrl}
                  title={`Evidence video ${idx + 1}`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          return (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-muted/30 group hover:bg-muted/50 flex aspect-video flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 transition-transform group-hover:scale-110">
                <Play className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-muted-foreground text-[10px] font-medium">Watch Video</span>
            </a>
          );
        }

        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border group relative aspect-square overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Evidence ${idx + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement | null;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
            <div
              className="bg-muted/50 hidden h-full w-full flex-col items-center justify-center gap-1"
              style={{ display: 'none' }}
            >
              <ImageIcon className="text-muted-foreground h-6 w-6" />
              <span className="text-muted-foreground text-[10px]">View File</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
              <ExternalLink className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </a>
        );
      })}
    </div>
  );
}
