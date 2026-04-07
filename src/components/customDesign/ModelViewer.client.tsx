// components/ModelViewer.client.tsx
'use client';

// Import trực tiếp thư viện tại đây, không dùng dynamic import bên trong nữa
import '@google/model-viewer';

export default function ModelViewerClient({ src }: { src: string }) {
  return (
    <div className="from-muted/50 to-muted/20 relative h-full w-full bg-gradient-to-b">
      {/* @ts-expect-error - Custom Web Component */}
      <model-viewer
        src={src}
        camera-controls
        auto-rotate
        shadow-intensity="1"
        exposure="1"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
