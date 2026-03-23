'use client';

import ReactMarkdown from 'react-markdown';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductTabsProps {
  description: string | null;
  specs: {
    topicName?: string;
    partnerName?: string;
    difficultLevel?: string;
    materialName?: string;
    totalPieceCount?: number;
    estimatedBuildTime?: number;
    assembledDimensions?: {
      length: number;
      width: number;
      height: number;
    };
  };
  isPartner?: boolean;
}

function formatBuildTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
}

export default function ProductTabs({ description, specs, isPartner = false }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="bg-secondary/50 grid w-full grid-cols-3">
        <TabsTrigger value="description" className="text-xs sm:text-sm">
          Detailed Description
        </TabsTrigger>
        <TabsTrigger value="specs" className="text-xs sm:text-sm">
          Specifications
        </TabsTrigger>
        <TabsTrigger value="shipping" className="text-xs sm:text-sm">
          Shipping
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="border-border bg-card mt-4 rounded-xl border p-6">
        <div className="prose prose-sm prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-th:text-foreground prose-td:text-muted-foreground max-w-none">
          <ReactMarkdown>{description || 'No detailed description available.'}</ReactMarkdown>
        </div>
      </TabsContent>

      <TabsContent value="specs" className="border-border bg-card mt-4 rounded-xl border p-6">
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-border border-b">
                <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                  {isPartner ? 'Partner' : 'Topic'}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {specs.partnerName || specs.topicName}
                </td>
              </tr>
              {specs.difficultLevel && (
                <tr className="border-border border-b">
                  <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                    Difficulty
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{specs.difficultLevel}</td>
                </tr>
              )}
              {specs.materialName && (
                <tr className="border-border border-b">
                  <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                    Material
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{specs.materialName}</td>
                </tr>
              )}
              {specs.totalPieceCount && (
                <tr className="border-border border-b">
                  <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                    Total Pieces
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {specs.totalPieceCount.toLocaleString('en-US')} pcs
                  </td>
                </tr>
              )}
              {specs.estimatedBuildTime && (
                <tr className="border-border border-b">
                  <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                    Build Time
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    ~{formatBuildTime(specs.estimatedBuildTime)}
                  </td>
                </tr>
              )}
              {specs.assembledDimensions && (
                <tr className="border-border border-b">
                  <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                    Assembled Dimensions
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {specs.assembledDimensions.length} × {specs.assembledDimensions.width} ×{' '}
                    {specs.assembledDimensions.height} mm
                  </td>
                </tr>
              )}
              <tr className="border-border border-b">
                <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                  Product Type
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {isPartner ? 'Partner product — Made to order' : 'In stock'}
                </td>
              </tr>
              <tr>
                <td className="bg-secondary/30 text-foreground w-1/3 px-4 py-3 font-semibold">
                  Warranty
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  7-day return if manufacturer defect
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
              <p className="text-foreground font-semibold">Standard Shipping</p>
              <p className="text-muted-foreground">
                3-5 business days. Shipping fee 30,000 VND (free for orders over 500,000 VND).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-brand/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <span className="text-brand text-base">🚀</span>
            </div>
            <div>
              <p className="text-foreground font-semibold">Express Shipping</p>
              <p className="text-muted-foreground">1-2 business days. Shipping fee 50,000 VND.</p>
            </div>
          </div>

          {isPartner && (
            <div className="flex items-start gap-3">
              <div className="bg-warning/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <span className="text-warning text-base">✈️</span>
              </div>
              <div>
                <p className="text-foreground font-semibold">Partner Product (International)</p>
                <p className="text-muted-foreground">
                  7-21 business days. Shipping cost will be quoted by staff after confirming the
                  order.
                </p>
              </div>
            </div>
          )}

          <div className="border-border mt-2 rounded-lg border p-4">
            <p className="text-foreground mb-1 text-xs font-semibold">Return Policy</p>
            <p className="text-muted-foreground text-xs">
              Free returns within 7 days of delivery if the product has a manufacturer defect.
              Product must be sealed and unopened.
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
