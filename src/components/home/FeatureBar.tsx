import { ShieldCheck, Truck, Wrench, RotateCcw } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Authentic 100%',
    description: 'Chính hãng từ nhà sản xuất',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Giao hàng nhanh toàn quốc',
  },
  {
    icon: Wrench,
    title: 'Expert Support',
    description: 'Hỗ trợ kỹ thuật chuyên nghiệp',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Đổi trả trong 7 ngày',
  },
];

export default function FeatureBar() {
  return (
    <section className="border-border bg-card/50 border-y">
      <div className="container-custom py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="hover:bg-secondary/50 flex items-center gap-4 rounded-lg px-4 py-3 transition-colors"
            >
              <div className="bg-brand/10 text-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-foreground text-sm font-bold">{feature.title}</p>
                <p className="text-muted-foreground text-xs">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
