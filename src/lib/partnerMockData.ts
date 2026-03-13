import type { Partner, PartnerProduct, ImportServiceConfig } from '@/types';

// ============ IMPORT SERVICE CONFIGS ============

export const importServiceConfigs: ImportServiceConfig[] = [
  {
    id: 'isc-001',
    code: 'JP-STD',
    baseShippingFee: 150_000,
    countryCode: 'JP',
    countryName: 'Nhật Bản',
    importTaxPercentage: 10,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'isc-002',
    code: 'CN-STD',
    baseShippingFee: 80_000,
    countryCode: 'CN',
    countryName: 'Trung Quốc',
    importTaxPercentage: 8,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'isc-003',
    code: 'DE-STD',
    baseShippingFee: 250_000,
    countryCode: 'DE',
    countryName: 'Đức',
    importTaxPercentage: 12,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ============ PARTNERS ============

export const partners: Partner[] = [
  {
    id: 'partner-brand-001',
    name: 'ROKR',
    description:
      'Thương hiệu mô hình gỗ cơ khí hàng đầu thế giới, nổi tiếng với Marble Run và đồng hồ cơ học.',
    contactEmail: 'wholesale@rokr.com',
    contactPhone: '+86-400-123-4567',
    address: 'Shenzhen, China',
    slug: 'rokr',
    importServiceConfigId: 'isc-002',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    importServiceConfig: importServiceConfigs[1],
  },
  {
    id: 'partner-brand-002',
    name: 'Ugears',
    description:
      'Thương hiệu Ukraine chuyên mô hình gỗ cơ khí với cơ chế hoạt động thực tế, không cần pin.',
    contactEmail: 'b2b@ugears.com',
    contactPhone: '+380-44-123-4567',
    address: 'Kyiv, Ukraine',
    slug: 'ugears',
    importServiceConfigId: 'isc-003',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    importServiceConfig: importServiceConfigs[2],
  },
  {
    id: 'partner-brand-003',
    name: 'Piececool',
    description: 'Thương hiệu mô hình kim loại 3D cao cấp với thiết kế Trung Hoa và phương Tây.',
    contactEmail: 'export@piececool.cn',
    contactPhone: '+86-755-8888-9999',
    address: 'Guangzhou, China',
    slug: 'piececool',
    importServiceConfigId: 'isc-002',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    importServiceConfig: importServiceConfigs[1],
  },
  {
    id: 'partner-brand-004',
    name: 'CubicFun',
    description:
      'Thương hiệu puzzle 3D nổi tiếng với các mô hình kiến trúc thế giới, LED tích hợp.',
    contactEmail: 'partner@cubicfun.com',
    contactPhone: '+86-20-1234-5678',
    address: 'Guangzhou, China',
    slug: 'cubicfun',
    importServiceConfigId: 'isc-002',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    importServiceConfig: importServiceConfigs[1],
  },
];

// ============ PARTNER PRODUCTS ============

export const partnerProducts: PartnerProduct[] = [
  {
    id: 'pp-001',
    partnerId: 'partner-brand-001',
    slug: 'rokr-marble-run-night-city',
    name: 'ROKR Marble Run Night City',
    referencePrice: 1_850_000,
    thumbnailUrl: 'https://placehold.co/600x600/2a2a45/f0c040?text=ROKR+Night+City',
    previewAsset: [
      'https://placehold.co/600x600/2a2a45/f0c040?text=Night+City+1',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Night+City+2',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Night+City+3',
    ],
    description:
      'Mô hình gỗ 3D ROKR Marble Run Night City với đèn LED. Bi chạy tự động qua các đường ray phức tạp.\n\n## Night City — Marble Run đỉnh cao\n\n**ROKR Marble Run Night City** là bộ kit marble run phức tạp và ấn tượng nhất của ROKR. Với hệ thống **LED neon** và đường ray uốn lượn, bi sẽ chạy qua thành phố lung linh.',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    partner: partners[0],
    rating: 4.8,
  },
  {
    id: 'pp-002',
    partnerId: 'partner-brand-002',
    slug: 'ugears-hurdy-gurdy',
    name: 'Ugears Hurdy-Gurdy Musical',
    referencePrice: 2_200_000,
    thumbnailUrl: 'https://placehold.co/600x600/3a2a20/f0d070?text=Ugears+Hurdy+Gurdy',
    previewAsset: [
      'https://placehold.co/600x600/3a2a20/f0d070?text=Hurdy+1',
      'https://placehold.co/600x600/3a2a20/f0d070?text=Hurdy+2',
      'https://placehold.co/600x600/3a2a20/f0d070?text=Hurdy+3',
    ],
    description:
      'Ugears Hurdy-Gurdy — nhạc cụ cơ khí bằng gỗ có khả năng phát âm thanh thực sự. Không dùng pin, hoạt động hoàn toàn bằng cơ học.',
    isActive: true,
    createdAt: '2024-05-15T00:00:00Z',
    updatedAt: '2024-05-15T00:00:00Z',
    partner: partners[1],
    rating: 4.9,
  },
  {
    id: 'pp-003',
    partnerId: 'partner-brand-003',
    slug: 'piececool-dragon-king',
    name: 'Piececool Dragon King Warship',
    referencePrice: 1_450_000,
    thumbnailUrl: 'https://placehold.co/600x600/2a1a1a/e0c040?text=Dragon+King',
    previewAsset: [
      'https://placehold.co/600x600/2a1a1a/e0c040?text=Dragon+1',
      'https://placehold.co/600x600/2a1a1a/e0c040?text=Dragon+2',
    ],
    description:
      'Mô hình kim loại 3D Dragon King Warship — tàu chiến rồng phong cách Trung Hoa. Chi tiết cực kỳ tinh xảo với hơn 300 mảnh ghép kim loại.',
    isActive: true,
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-07-01T00:00:00Z',
    partner: partners[2],
    rating: 4.6,
  },
  {
    id: 'pp-004',
    partnerId: 'partner-brand-001',
    slug: 'rokr-cello-music-box',
    name: 'ROKR Cello Music Box AMK63',
    referencePrice: 890_000,
    thumbnailUrl: 'https://placehold.co/600x600/2a3a2a/d0e0c0?text=ROKR+Cello',
    previewAsset: [
      'https://placehold.co/600x600/2a3a2a/d0e0c0?text=Cello+1',
      'https://placehold.co/600x600/2a3a2a/d0e0c0?text=Cello+2',
    ],
    description:
      'ROKR Cello Music Box — mô hình gỗ cây đàn Cello tích hợp hộp nhạc. Quay tay để phát nhạc, thiết kế tinh xảo.',
    isActive: true,
    createdAt: '2024-06-20T00:00:00Z',
    updatedAt: '2024-06-20T00:00:00Z',
    partner: partners[0],
    rating: 4.5,
  },
  {
    id: 'pp-005',
    partnerId: 'partner-brand-002',
    slug: 'ugears-chronograph-timer',
    name: 'Ugears Chronograph Date Navigator',
    referencePrice: 1_650_000,
    thumbnailUrl: 'https://placehold.co/600x600/1a2a3a/c0d0e0?text=Ugears+Chrono',
    previewAsset: [
      'https://placehold.co/600x600/1a2a3a/c0d0e0?text=Chrono+1',
      'https://placehold.co/600x600/1a2a3a/c0d0e0?text=Chrono+2',
      'https://placehold.co/600x600/1a2a3a/c0d0e0?text=Chrono+3',
    ],
    description:
      'Ugears Chronograph Date Navigator — mô hình đồng hồ cơ khí tự xoay với lịch hiển thị ngày/tháng. Cơ chế chạy thực sự, không cần pin.',
    isActive: true,
    createdAt: '2024-07-10T00:00:00Z',
    updatedAt: '2024-07-10T00:00:00Z',
    partner: partners[1],
    rating: 4.7,
  },
  {
    id: 'pp-006',
    partnerId: 'partner-brand-003',
    slug: 'piececool-iron-star-mecha',
    name: 'Piececool Iron Star Mecha Warrior',
    referencePrice: 1_280_000,
    thumbnailUrl: 'https://placehold.co/600x600/2a2a2a/c0c0e0?text=Iron+Star+Mecha',
    previewAsset: [
      'https://placehold.co/600x600/2a2a2a/c0c0e0?text=Mecha+1',
      'https://placehold.co/600x600/2a2a2a/c0c0e0?text=Mecha+2',
    ],
    description:
      'Mô hình kim loại 3D Iron Star Mecha Warrior — robot chiến binh phong cách sci-fi. Khớp nối linh hoạt, có thể tạo nhiều pose.',
    isActive: true,
    createdAt: '2024-08-05T00:00:00Z',
    updatedAt: '2024-08-05T00:00:00Z',
    partner: partners[2],
    rating: 4.4,
  },
  {
    id: 'pp-007',
    partnerId: 'partner-brand-004',
    slug: 'cubicfun-notre-dame-led',
    name: 'CubicFun Notre-Dame LED 3D',
    referencePrice: 750_000,
    thumbnailUrl: 'https://placehold.co/600x600/3a3a1a/e0e0c0?text=Notre+Dame+LED',
    previewAsset: [
      'https://placehold.co/600x600/3a3a1a/e0e0c0?text=Notre+Dame+1',
      'https://placehold.co/600x600/3a3a1a/e0e0c0?text=Notre+Dame+2',
    ],
    description:
      'CubicFun Notre-Dame de Paris 3D Puzzle với hệ thống LED bên trong, tạo hiệu ứng lung linh về đêm.',
    isActive: true,
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    partner: partners[3],
    rating: 4.3,
  },
  {
    id: 'pp-008',
    partnerId: 'partner-brand-004',
    slug: 'cubicfun-colosseum-giant',
    name: 'CubicFun Colosseum Giant Edition',
    referencePrice: 1_100_000,
    thumbnailUrl: 'https://placehold.co/600x600/2a2a1a/d0d0c0?text=Colosseum+Giant',
    previewAsset: [
      'https://placehold.co/600x600/2a2a1a/d0d0c0?text=Colosseum+1',
      'https://placehold.co/600x600/2a2a1a/d0d0c0?text=Colosseum+2',
    ],
    description:
      'CubicFun Colosseum Giant Edition — mô hình 3D Đấu trường La Mã kích thước lớn. Tái hiện kiến trúc cổ đại chân thực nhất.',
    isActive: true,
    createdAt: '2024-06-10T00:00:00Z',
    updatedAt: '2024-06-10T00:00:00Z',
    partner: partners[3],
    rating: 4.5,
  },
];

// ============ HELPERS ============

export function getPartnerProductBySlug(slug: string): PartnerProduct | undefined {
  return partnerProducts.find((p) => p.slug === slug);
}

export function getPartnerNames(): string[] {
  return [...new Set(partners.map((p) => p.name))];
}

export function getRelatedPartnerProducts(
  currentSlug: string,
  limit: number = 4
): PartnerProduct[] {
  const current = partnerProducts.find((p) => p.slug === currentSlug);
  if (!current) return [];
  return partnerProducts
    .filter((p) => p.slug !== currentSlug && p.partnerId === current.partnerId)
    .slice(0, limit);
}
