import type {
  Topic,
  AssemblyMethod,
  Material,
  Capability,
  InstockProduct,
  InstockProductVariantWithDetails,
} from '@/types';

// ============ CATALOG MOCK DATA ============

export const topics: Topic[] = [
  {
    id: 'topic-001',
    name: 'Gundam',
    description: 'Mô hình Gundam từ series Mobile Suit Gundam',
    slug: 'gundam',
    parentId: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'topic-002',
    name: 'Kiến trúc',
    description: 'Mô hình kiến trúc và công trình nổi tiếng',
    slug: 'kien-truc',
    parentId: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'topic-003',
    name: 'Phương tiện',
    description: 'Mô hình xe, tàu, máy bay',
    slug: 'phuong-tien',
    parentId: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'topic-004',
    name: 'Figure',
    description: 'Mô hình nhân vật, figure anime',
    slug: 'figure',
    parentId: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'topic-005',
    name: 'Diorama',
    description: 'Mô hình diorama, cảnh quan',
    slug: 'diorama',
    parentId: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const assemblyMethods: AssemblyMethod[] = [
  {
    id: 'asm-001',
    name: 'Snap-fit',
    description: 'Lắp ghép bằng khớp nối, không cần keo',
    slug: 'snap-fit',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'asm-002',
    name: 'Keo dán',
    description: 'Cần sử dụng keo dán để lắp ráp',
    slug: 'keo-dan',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'asm-003',
    name: 'Kim loại xoắn',
    description: 'Lắp bằng cách xoắn/gấp tấm kim loại',
    slug: 'kim-loai-xoan',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const materials: Material[] = [
  {
    id: 'mat-001',
    name: 'Nhựa PS',
    description: 'Nhựa Polystyrene cao cấp',
    slug: 'nhua-ps',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mat-002',
    name: 'Kim loại',
    description: 'Tấm kim loại cắt laser',
    slug: 'kim-loai',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'mat-003',
    name: 'Gỗ',
    description: 'Gỗ ván ép cắt laser',
    slug: 'go',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const capabilities: Capability[] = [
  {
    id: 'cap-001',
    name: 'LED',
    description: 'Có đèn LED trang trí',
    slug: 'led',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cap-002',
    name: 'Khớp động',
    description: 'Có khớp nối di chuyển được',
    slug: 'khop-dong',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cap-003',
    name: 'Âm thanh',
    description: 'Có module phát âm thanh',
    slug: 'am-thanh',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// ============ HELPER: create variant with details ============

function createVariant(
  id: string,
  productId: string,
  sku: string,
  color: string,
  dims: [number, number, number],
  unitPrice: number,
  stock: number
): InstockProductVariantWithDetails {
  return {
    id,
    instockProductId: productId,
    sku,
    color,
    assembledLengthMm: dims[0],
    assembledWidthMm: dims[1],
    assembledHeightMm: dims[2],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    priceDetail: {
      id: `pd-${id}`,
      instockPriceId: 'price-default',
      instockProductVariantId: id,
      unitPrice,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    inventory: {
      id: `inv-${id}`,
      instockProductVariantId: id,
      totalQuantity: stock,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  };
}

// ============ INSTOCK PRODUCTS ============

export const products: InstockProduct[] = [
  {
    id: 'prod-001',
    code: 'GD-RX78',
    slug: 'rx-78-2-gundam-ver-ka',
    name: 'RX-78-2 Gundam Ver.Ka MG 1/100',
    totalPieceCount: 480,
    difficultLevel: 'HARD',
    estimatedBuildTime: 480,
    thumbnailUrl: 'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Gundam',
    previewAsset: [
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Front',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Side',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Back',
    ],
    description:
      'Mô hình Gundam RX-78-2 phiên bản Ver.Ka tỷ lệ 1/100 (Master Grade). Thiết kế chi tiết với khớp nối linh hoạt, phù hợp cho người chơi có kinh nghiệm.\n\n## Tổng quan\n\n**RX-78-2 Gundam Ver.Ka** là phiên bản Master Grade được thiết kế bởi Hajime Katoki. Bộ kit gồm **480 chi tiết** nhựa PS cao cấp.\n\n### Đặc điểm nổi bật\n\n- Khung inner frame toàn bộ\n- Khớp nối đa hướng linh hoạt\n- Decal nước (waterslide) độ phân giải cao\n- Weapon set đầy đủ: Beam Rifle, Shield, Beam Saber x2',
    topicId: 'topic-001',
    assemblyMethodId: 'asm-001',
    capabilityId: 'cap-002',
    materialId: 'mat-001',
    isActive: true,
    createdAt: '2024-06-15T00:00:00Z',
    updatedAt: '2024-06-15T00:00:00Z',
    topic: topics[0],
    assemblyMethod: assemblyMethods[0],
    material: materials[0],
    capability: capabilities[1],
    variants: [
      createVariant('var-001', 'prod-001', 'RX78-W', 'Trắng', [180, 80, 250], 1_350_000, 15),
      createVariant('var-002', 'prod-001', 'RX78-T', 'Titanium', [180, 80, 250], 1_600_000, 5),
    ],
    rating: 4.8,
    soldCount: 2340,
  },
  {
    id: 'prod-002',
    code: 'GD-SAZB',
    slug: 'sazabi-ver-ka-mg',
    name: 'Sazabi Ver.Ka MG 1/100',
    totalPieceCount: 620,
    difficultLevel: 'EXPERT',
    estimatedBuildTime: 720,
    thumbnailUrl: 'https://placehold.co/600x600/2e1a1a/e0e0e0?text=Sazabi+Ver.Ka',
    previewAsset: [
      'https://placehold.co/600x600/2e1a1a/e0e0e0?text=Sazabi+Front',
      'https://placehold.co/600x600/2e1a1a/e0e0e0?text=Sazabi+Side',
      'https://placehold.co/600x600/2e1a1a/e0e0e0?text=Sazabi+Back',
    ],
    description:
      'Mô hình Sazabi Ver.Ka MG 1/100 — kiệt tác pinnacle của dòng Master Grade. Armor chi tiết cực kỳ phức tạp, phù hợp cho modeler chuyên nghiệp.\n\n## Chi tiết sản phẩm\n\nBộ kit **Sazabi Ver.Ka** có hơn **620 chi tiết**, hệ thống armor có thể mở ra (open hatch), inner frame hoàn chỉnh.',
    topicId: 'topic-001',
    assemblyMethodId: 'asm-001',
    capabilityId: 'cap-002',
    materialId: 'mat-001',
    isActive: true,
    createdAt: '2024-06-10T00:00:00Z',
    updatedAt: '2024-06-10T00:00:00Z',
    topic: topics[0],
    assemblyMethod: assemblyMethods[0],
    material: materials[0],
    capability: capabilities[1],
    variants: [createVariant('var-003', 'prod-002', 'SAZB-R', 'Đỏ', [200, 100, 280], 2_100_000, 8)],
    rating: 4.9,
    soldCount: 1820,
  },
  {
    id: 'prod-003',
    code: 'ML-EIF',
    slug: 'eiffel-tower-metal-3d',
    name: 'Tháp Eiffel Metal Earth 3D',
    totalPieceCount: 42,
    difficultLevel: 'MEDIUM',
    estimatedBuildTime: 120,
    thumbnailUrl: 'https://placehold.co/600x600/1a2e1a/e0e0e0?text=Eiffel+Tower',
    previewAsset: [
      'https://placehold.co/600x600/1a2e1a/e0e0e0?text=Eiffel+Front',
      'https://placehold.co/600x600/1a2e1a/e0e0e0?text=Eiffel+Side',
    ],
    description:
      'Mô hình kim loại 3D tháp Eiffel — Metal Earth. Cắt laser siêu chi tiết, lắp ráp bằng cách gấp tấm kim loại.\n\n## Sản phẩm bao gồm\n\n- 2 tấm kim loại cắt laser\n- Hướng dẫn lắp ráp hình ảnh\n- Không cần keo dán',
    topicId: 'topic-002',
    assemblyMethodId: 'asm-003',
    capabilityId: 'cap-001',
    materialId: 'mat-002',
    isActive: true,
    createdAt: '2024-05-20T00:00:00Z',
    updatedAt: '2024-05-20T00:00:00Z',
    topic: topics[1],
    assemblyMethod: assemblyMethods[2],
    material: materials[1],
    capability: capabilities[0],
    variants: [
      createVariant('var-004', 'prod-003', 'EIF-SL', 'Bạc', [45, 45, 150], 320_000, 50),
      createVariant('var-005', 'prod-003', 'EIF-GD', 'Vàng', [45, 45, 150], 380_000, 30),
    ],
    rating: 4.5,
    soldCount: 5100,
  },
  {
    id: 'prod-004',
    code: 'GD-WING',
    slug: 'wing-gundam-zero-ew-mg',
    name: 'Wing Gundam Zero EW MG 1/100',
    totalPieceCount: 350,
    difficultLevel: 'HARD',
    estimatedBuildTime: 360,
    thumbnailUrl: 'https://placehold.co/600x600/1a1a3e/e0e0e0?text=Wing+Zero+EW',
    previewAsset: [
      'https://placehold.co/600x600/1a1a3e/e0e0e0?text=Wing+Front',
      'https://placehold.co/600x600/1a1a3e/e0e0e0?text=Wing+Side',
      'https://placehold.co/600x600/1a1a3e/e0e0e0?text=Wing+Back',
    ],
    description:
      'Wing Gundam Zero EW phiên bản nguyên tác Endless Waltz. Cánh thiên thần mở rộng ấn tượng.\n\n## Đặc điểm\n\n- Cánh thiên thần có thể gập/mở\n- Twin Buster Rifle kèm theo\n- Stand hiển thị bay',
    topicId: 'topic-001',
    assemblyMethodId: 'asm-001',
    capabilityId: 'cap-002',
    materialId: 'mat-001',
    isActive: true,
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-07-01T00:00:00Z',
    topic: topics[0],
    assemblyMethod: assemblyMethods[0],
    material: materials[0],
    capability: capabilities[1],
    variants: [
      createVariant('var-006', 'prod-004', 'WING-W', 'Trắng', [195, 90, 260], 980_000, 20),
    ],
    rating: 4.7,
    soldCount: 1560,
  },
  {
    id: 'prod-005',
    code: 'ML-STAR',
    slug: 'star-destroyer-metal-3d',
    name: 'Star Destroyer Metal 3D',
    totalPieceCount: 65,
    difficultLevel: 'HARD',
    estimatedBuildTime: 180,
    thumbnailUrl: 'https://placehold.co/600x600/2e2e1a/e0e0e0?text=Star+Destroyer',
    previewAsset: [
      'https://placehold.co/600x600/2e2e1a/e0e0e0?text=Star+Front',
      'https://placehold.co/600x600/2e2e1a/e0e0e0?text=Star+Top',
    ],
    description:
      'Mô hình Star Destroyer từ series Star Wars — Metal Earth. 3 tấm kim loại, chi tiết bề mặt cực kỳ sắc nét.',
    topicId: 'topic-003',
    assemblyMethodId: 'asm-003',
    capabilityId: 'cap-001',
    materialId: 'mat-002',
    isActive: true,
    createdAt: '2024-05-25T00:00:00Z',
    updatedAt: '2024-05-25T00:00:00Z',
    topic: topics[2],
    assemblyMethod: assemblyMethods[2],
    material: materials[1],
    capability: capabilities[0],
    variants: [createVariant('var-007', 'prod-005', 'STAR-SL', 'Bạc', [120, 65, 40], 450_000, 25)],
    rating: 4.6,
    soldCount: 3200,
  },
  {
    id: 'prod-006',
    code: 'GD-UNIC',
    slug: 'unicorn-gundam-pg',
    name: 'Unicorn Gundam PG 1/60',
    totalPieceCount: 780,
    difficultLevel: 'EXPERT',
    estimatedBuildTime: 1200,
    thumbnailUrl: 'https://placehold.co/600x600/1a1a2e/e0c0c0?text=Unicorn+PG',
    previewAsset: [
      'https://placehold.co/600x600/1a1a2e/e0c0c0?text=Unicorn+Front',
      'https://placehold.co/600x600/1a1a2e/e0c0c0?text=Unicorn+Side',
      'https://placehold.co/600x600/1a1a2e/e0c0c0?text=Unicorn+LED',
    ],
    description:
      'Unicorn Gundam PG 1/60 với hệ thống LED tích hợp. Chế độ Unicorn ↔ Destroy chuyển đổi thực tế.\n\n## Điểm nổi bật\n\n- LED Unit tích hợp (Psycho Frame)\n- Chuyển đổi Unicorn ↔ Destroy Mode\n- Inner Frame hoàn chỉnh PG',
    topicId: 'topic-001',
    assemblyMethodId: 'asm-001',
    capabilityId: 'cap-001',
    materialId: 'mat-001',
    isActive: true,
    createdAt: '2024-04-10T00:00:00Z',
    updatedAt: '2024-04-10T00:00:00Z',
    topic: topics[0],
    assemblyMethod: assemblyMethods[0],
    material: materials[0],
    capability: capabilities[0],
    variants: [
      createVariant('var-008', 'prod-006', 'UNIC-W', 'Trắng', [280, 120, 400], 4_500_000, 3),
    ],
    rating: 4.9,
    soldCount: 890,
  },
  {
    id: 'prod-007',
    code: 'WD-CASA',
    slug: 'casa-batllo-3d-puzzle',
    name: 'Casa Batlló 3D Wooden Puzzle',
    totalPieceCount: 220,
    difficultLevel: 'MEDIUM',
    estimatedBuildTime: 240,
    thumbnailUrl: 'https://placehold.co/600x600/2e1a2e/e0e0e0?text=Casa+Batllo',
    previewAsset: [
      'https://placehold.co/600x600/2e1a2e/e0e0e0?text=Casa+Front',
      'https://placehold.co/600x600/2e1a2e/e0e0e0?text=Casa+Side',
    ],
    description:
      'Mô hình gỗ 3D Casa Batlló — kiệt tác kiến trúc của Gaudí tại Barcelona. Bao gồm đèn LED bên trong.',
    topicId: 'topic-002',
    assemblyMethodId: 'asm-002',
    capabilityId: 'cap-001',
    materialId: 'mat-003',
    isActive: true,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
    topic: topics[1],
    assemblyMethod: assemblyMethods[1],
    material: materials[2],
    capability: capabilities[0],
    variants: [
      createVariant('var-009', 'prod-007', 'CASA-NT', 'Gỗ tự nhiên', [200, 100, 300], 780_000, 12),
    ],
    rating: 4.4,
    soldCount: 1200,
  },
  {
    id: 'prod-008',
    code: 'GD-BARB',
    slug: 'barbatos-lupus-rex-fm',
    name: 'Barbatos Lupus Rex FM 1/100',
    totalPieceCount: 310,
    difficultLevel: 'HARD',
    estimatedBuildTime: 300,
    thumbnailUrl: 'https://placehold.co/600x600/1a2e2e/e0e0e0?text=Barbatos+Rex',
    previewAsset: [
      'https://placehold.co/600x600/1a2e2e/e0e0e0?text=Barbatos+Front',
      'https://placehold.co/600x600/1a2e2e/e0e0e0?text=Barbatos+Side',
    ],
    description:
      'Full Mechanics Barbatos Lupus Rex 1/100. Thiết kế hung hãn với Mace và Tail Blade bản to.',
    topicId: 'topic-001',
    assemblyMethodId: 'asm-001',
    capabilityId: 'cap-002',
    materialId: 'mat-001',
    isActive: true,
    createdAt: '2024-07-20T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z',
    topic: topics[0],
    assemblyMethod: assemblyMethods[0],
    material: materials[0],
    capability: capabilities[1],
    variants: [createVariant('var-010', 'prod-008', 'BARB-GY', 'Xám', [170, 85, 240], 750_000, 18)],
    rating: 4.7,
    soldCount: 1890,
  },
  {
    id: 'prod-009',
    code: 'ML-TITA',
    slug: 'titanic-metal-3d',
    name: 'RMS Titanic Metal 3D',
    totalPieceCount: 58,
    difficultLevel: 'MEDIUM',
    estimatedBuildTime: 150,
    thumbnailUrl: 'https://placehold.co/600x600/1a1a1a/c0c0c0?text=Titanic',
    previewAsset: [
      'https://placehold.co/600x600/1a1a1a/c0c0c0?text=Titanic+Side',
      'https://placehold.co/600x600/1a1a1a/c0c0c0?text=Titanic+Top',
    ],
    description:
      'Mô hình kim loại RMS Titanic với chi tiết ống khói, boong tàu và cấu trúc sàn chính xác.',
    topicId: 'topic-003',
    assemblyMethodId: 'asm-003',
    capabilityId: 'cap-001',
    materialId: 'mat-002',
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    topic: topics[2],
    assemblyMethod: assemblyMethods[2],
    material: materials[1],
    capability: capabilities[0],
    variants: [createVariant('var-011', 'prod-009', 'TITA-SL', 'Bạc', [140, 30, 45], 280_000, 40)],
    rating: 4.3,
    soldCount: 4500,
  },
  {
    id: 'prod-010',
    code: 'GD-FRDM',
    slug: 'freedom-gundam-mg',
    name: 'Freedom Gundam MGEX 1/100',
    totalPieceCount: 560,
    difficultLevel: 'EXPERT',
    estimatedBuildTime: 600,
    thumbnailUrl: 'https://placehold.co/600x600/1a1a4e/e0e0e0?text=Freedom+MGEX',
    previewAsset: [
      'https://placehold.co/600x600/1a1a4e/e0e0e0?text=Freedom+Front',
      'https://placehold.co/600x600/1a1a4e/e0e0e0?text=Freedom+Wing',
      'https://placehold.co/600x600/1a1a4e/e0e0e0?text=Freedom+Side',
    ],
    description:
      'Freedom Gundam MGEX — phiên bản Extreme cao cấp nhất. LED tích hợp dọc cánh và thân.\n\n## MGEX — Master Grade Extreme\n\n- Hệ thống LED Extreme tích hợp\n- Cánh DRAGOON System mở rộng\n- Inner Frame chi tiết cực cao',
    topicId: 'topic-001',
    assemblyMethodId: 'asm-001',
    capabilityId: 'cap-001',
    materialId: 'mat-001',
    isActive: true,
    createdAt: '2024-08-10T00:00:00Z',
    updatedAt: '2024-08-10T00:00:00Z',
    topic: topics[0],
    assemblyMethod: assemblyMethods[0],
    material: materials[0],
    capability: capabilities[0],
    variants: [
      createVariant('var-012', 'prod-010', 'FRDM-B', 'Xanh/Trắng', [200, 100, 300], 3_200_000, 0),
    ],
    rating: 4.8,
    soldCount: 1100,
  },
];

// ============ HELPERS ============

export function getProductBySlug(slug: string): InstockProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getDefaultVariant(product: InstockProduct): InstockProductVariantWithDetails {
  return product.variants[0];
}

export function getProductPrice(product: InstockProduct): number {
  return getDefaultVariant(product).priceDetail.unitPrice;
}

export function isProductInStock(product: InstockProduct): boolean {
  return product.variants.some((v) => v.inventory.totalQuantity > 0);
}

export function getRelatedProducts(currentSlug: string, limit: number = 4): InstockProduct[] {
  const current = products.find((p) => p.slug === currentSlug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== currentSlug && p.topicId === current.topicId)
    .slice(0, limit);
}

export function getTopics(): Topic[] {
  return topics;
}

export function getMaterials(): Material[] {
  return materials;
}
