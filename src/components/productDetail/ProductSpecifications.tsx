import { Package, Scale, Clock } from 'lucide-react';
import {
  TopicBadge,
  MaterialBadge,
  CapabilitiesList,
  AssemblyList,
} from './ProductSpecDynamicBadges';

interface ProductSpecificationsProps {
  product: any; // Thay bằng type Product của ông cho chuẩn nhé
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // Interactive badging logic extracted to ProductSpecDynamicBadges.tsx

  return (
    <section>
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
        <span className="h-6 w-1 rounded-full bg-[#052a5b]"></span>
        Full Specifications
      </h3>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/* Pieces */}
        {product.totalPieceCount && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Package className="mb-1 h-6 w-6 text-[#052a5b]" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Pieces
            </span>
            <span className="text-lg font-black text-slate-900">{product.totalPieceCount}</span>
          </div>
        )}

        {/* Difficulty */}
        {product.difficultLevel && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Scale className="mb-1 h-6 w-6 text-[#e51636]" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Difficulty
            </span>
            <span className="text-lg font-black text-slate-900">{product.difficultLevel}</span>
          </div>
        )}

        {/* Build Time */}
        {product.estimatedBuildTime && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <Clock className="mb-1 h-6 w-6 text-emerald-600" />
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              Build Time
            </span>
            <span className="text-lg font-black text-slate-900">
              {product.estimatedBuildTime} <span className="text-xs">mins</span>
            </span>
          </div>
        )}

        {product.topicId && <TopicBadge topicId={product.topicId} />}

        {product.materialId && <MaterialBadge materialId={product.materialId} />}
      </div>
      {product.assemblyMethodId && product.assemblyMethodId.length > 0 && (
        <AssemblyList assemblyMethodIds={product.assemblyMethodId} />
      )}
      {/* Capabilities */}
      <CapabilitiesList capabilityIds={product.capabilityIds} />
    </section>
  );
}
