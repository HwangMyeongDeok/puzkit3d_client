'use client';

import { Lightbulb, Hand, Zap, Music, Box, Star, Loader2 } from 'lucide-react';

// Chỉnh lại đường dẫn import này cho đúng với project của ông nha
import { useGetCapabilitiesQuery } from '@/lib/api/endpoints/metaData';

// Từ điển map Icon dựa vào slug của Backend
const ICON_MAP: Record<string, React.ElementType> = {
  'led-light-feature': Lightbulb,
  'manual-movement': Hand,
  'move-with-motor': Zap,
  'musical-gear': Music,
  'static-display': Box,
};

export default function TrustBadges() {
  // Gọi API lấy 4 cái capabilities đầu tiên cho nó vừa vặn với cái grid 4 cột
  const { data, isLoading, isError } = useGetCapabilitiesQuery({
    pageNumber: 1,
    pageSize: 4,
    isActive: true,
  });

  const capabilities = data?.items ?? [];

  if (isLoading) {
    return (
      <section className="border-border bg-card/50 border-y">
        <div className="container-custom flex items-center justify-center py-10 lg:py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      </section>
    );
  }

  // Nếu lỗi hoặc không có data thì ẩn luôn section này cho đỡ kỳ
  if (isError || capabilities.length === 0) {
    return null;
  }

  return (
    <section className="border-border bg-card/50 border-y">
      <div className="container-custom py-10 lg:py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((capability) => {
            // Tìm icon theo slug, nếu backend đẻ thêm slug mới mà mình chưa kịp map thì dùng icon Star
            const IconComponent = ICON_MAP[capability.slug] || Star;

            return (
              <div
                key={capability.id}
                className="hover:bg-secondary/50 flex items-center gap-4 rounded-xl px-4 py-3 transition-colors"
              >
                <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-bold">{capability.name}</p>
                  <p
                    className="text-muted-foreground line-clamp-2 text-xs"
                    title={capability.description}
                  >
                    {capability.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
