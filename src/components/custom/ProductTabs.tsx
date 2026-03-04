'use client';

import ReactMarkdown from 'react-markdown';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductTabsProps {
  longDescription: string;
  specs: {
    brand: string;
    difficulty?: string;
    style?: string;
    material?: string;
  };
  isPartner?: boolean;
}

export default function ProductTabs({
  longDescription,
  specs,
  isPartner = false,
}: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="bg-secondary/50 grid w-full grid-cols-3">
        <TabsTrigger value="description" className="text-xs sm:text-sm">
          Mô tả chi tiết
        </TabsTrigger>
        <TabsTrigger value="specs" className="text-xs sm:text-sm">
          Thông số
        </TabsTrigger>
        <TabsTrigger value="shipping" className="text-xs sm:text-sm">
          Vận chuyển
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="border-border bg-card mt-4 rounded-xl border p-6">
        <div className="prose prose-sm prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-th:text-foreground prose-td:text-muted-foreground max-w-none">
          <ReactMarkdown>{longDescription}</ReactMarkdown>
        </div>
      </TabsContent>

      <TabsContent value="specs" className="border-border bg-card mt-4 rounded-xl border p-6">
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-border border-b">
                <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                  Thương hiệu
                </td>
                <td className="text-muted-foreground px-4 py-3">{specs.brand}</td>
              </tr>
              {specs.difficulty && (
                <tr className="border-border border-b">
                  <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                    Độ khó
                  </td>
                  <td className="text-muted-foreground px-4 py-3 capitalize">{specs.difficulty}</td>
                </tr>
              )}
              {specs.style && (
                <tr className="border-border border-b">
                  <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                    Phong cách
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{specs.style}</td>
                </tr>
              )}
              <tr className="border-border border-b">
                <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                  Chất liệu
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {specs.material ||
                    (isPartner ? 'Gỗ / Kim loại (tùy sản phẩm)' : 'Nhựa PS, PE, ABS')}
                </td>
              </tr>
              <tr className="border-border border-b">
                <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                  Loại sản phẩm
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {isPartner ? 'Hàng đối tác — Đặt theo yêu cầu' : 'Hàng có sẵn'}
                </td>
              </tr>
              <tr>
                <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                  Bảo hành
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  Đổi trả trong 7 ngày nếu lỗi nhà sản xuất
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="border-border bg-card mt-4 rounded-xl border p-6">
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-start gap-3">
            <div className="bg-brand/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <span className="text-brand text-base">📦</span>
            </div>
            <div>
              <p className="text-foreground font-semibold">Giao hàng tiêu chuẩn</p>
              <p className="text-muted-foreground">
                3-5 ngày làm việc. Phí ship 30.000đ (miễn phí cho đơn từ 500.000đ).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-brand/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <span className="text-brand text-base">🚀</span>
            </div>
            <div>
              <p className="text-foreground font-semibold">Giao hàng nhanh</p>
              <p className="text-muted-foreground">1-2 ngày làm việc. Phí ship 50.000đ.</p>
            </div>
          </div>

          {isPartner && (
            <div className="flex items-start gap-3">
              <div className="bg-warning/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <span className="text-warning text-base">✈️</span>
              </div>
              <div>
                <p className="text-foreground font-semibold">Hàng đối tác (quốc tế)</p>
                <p className="text-muted-foreground">
                  7-21 ngày làm việc. Phí vận chuyển sẽ được Staff báo giá cụ thể sau khi xác nhận
                  đơn hàng.
                </p>
              </div>
            </div>
          )}

          <div className="border-border mt-2 rounded-lg border p-4">
            <p className="text-foreground mb-1 text-xs font-semibold">Chính sách đổi trả</p>
            <p className="text-muted-foreground text-xs">
              Đổi trả miễn phí trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi do nhà sản
              xuất. Sản phẩm phải còn nguyên seal, chưa mở hộp.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
