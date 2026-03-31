import { Image as ImageIcon, Play } from 'lucide-react';

export default function AttachedEvidence({ proof }: { proof: string | undefined }) {
  if (!proof) return null;

  return (
    <div className="bg-card border-border flex flex-col rounded-xl border p-5 shadow-sm">
      <h3 className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
        <ImageIcon className="h-4 w-4" /> Attached Evidence
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {proof.split(',').map((url, index) => {
          const cleanUrl = url.trim();
          if (!cleanUrl) return null;

          const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const ytMatch = cleanUrl.match(ytRegExp);
          const youtubeId = ytMatch && ytMatch[2].length === 11 ? ytMatch[2] : null;
          const isDirectVideo = cleanUrl.match(/\.(mp4|webm|ogg|mov)$/i);

          return (
            <div
              key={index}
              className="group border-border bg-muted/50 relative aspect-square overflow-hidden rounded-lg border shadow-sm"
            >
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  className="h-full w-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isDirectVideo ? (
                <div className="h-full w-full cursor-pointer">
                  <video
                    src={cleanUrl}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/30">
                    <div className="bg-background/90 rounded-full p-2 shadow-sm backdrop-blur-sm transition-transform group-hover:scale-110">
                      <Play className="text-primary fill-primary h-4 w-4" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={cleanUrl}
                  alt={`Evidence ${index + 1}`}
                  className="h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-muted-foreground mt-3 text-center text-xs">
        Click on an item to view full size
      </p>
    </div>
  );
}
