export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  rating: number;
  soldCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  image: string;
  images: string[];
  description: string;
  inStock: boolean;
}

export const products: MockProduct[] = [
  {
    id: 'prod-001',
    slug: 'rx-78-2-gundam-ver-ka',
    name: 'RX-78-2 Gundam Ver.Ka MG 1/100',
    brand: 'Bandai',
    price: 1_350_000,
    originalPrice: 1_600_000,
    rating: 4.8,
    soldCount: 2340,
    difficulty: 'hard',
    image: 'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Gundam',
    images: [
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Front',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Side',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=RX-78-2+Back',
    ],
    description:
      'Mô hình Gundam RX-78-2 phiên bản Ver.Ka tỷ lệ 1/100 (Master Grade). Thiết kế chi tiết với khớp nối linh hoạt, phù hợp cho người chơi có kinh nghiệm.',
    inStock: true,
  },
  {
    id: 'prod-002',
    slug: 'ugears-hurdy-gurdy',
    name: 'Ugears Hurdy-Gurdy Mechanical Model',
    brand: 'Ugears',
    price: 2_890_000,
    originalPrice: 3_200_000,
    rating: 4.9,
    soldCount: 1850,
    difficulty: 'expert',
    image: 'https://placehold.co/600x600/2d2d44/e0e0e0?text=Hurdy-Gurdy',
    images: [
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Hurdy-Gurdy+1',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Hurdy-Gurdy+2',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Hurdy-Gurdy+3',
    ],
    description:
      'Mô hình cơ khí bằng gỗ cao cấp Ugears Hurdy-Gurdy. Có thể thực sự chơi nhạc sau khi lắp ráp. Không cần keo dán, tự lắp ráp hoàn toàn.',
    inStock: true,
  },
  {
    id: 'prod-003',
    slug: 'tamiya-tiger-i-tank',
    name: 'Tamiya 1/35 Tiger I Tank Late Version',
    brand: 'Tamiya',
    price: 980_000,
    originalPrice: 1_100_000,
    rating: 4.7,
    soldCount: 3120,
    difficulty: 'medium',
    image: 'https://placehold.co/600x600/3a3a5c/e0e0e0?text=Tiger+I+Tank',
    images: [
      'https://placehold.co/600x600/3a3a5c/e0e0e0?text=Tiger+I+1',
      'https://placehold.co/600x600/3a3a5c/e0e0e0?text=Tiger+I+2',
      'https://placehold.co/600x600/3a3a5c/e0e0e0?text=Tiger+I+3',
    ],
    description:
      'Mô hình xe tăng Tiger I phiên bản cuối tỷ lệ 1/35 của Tamiya. Chi tiết cực cao, phù hợp cho người chơi trung cấp.',
    inStock: true,
  },
  {
    id: 'prod-004',
    slug: 'strike-freedom-gundam-pg',
    name: 'Strike Freedom Gundam PG 1/60',
    brand: 'Bandai',
    price: 6_500_000,
    originalPrice: 7_200_000,
    rating: 4.9,
    soldCount: 890,
    difficulty: 'expert',
    image: 'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Strike+Freedom',
    images: [
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Strike+Freedom+1',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Strike+Freedom+2',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Strike+Freedom+3',
    ],
    description:
      'Mô hình Gundam Strike Freedom PG 1/60 — Perfect Grade. Kit cao cấp nhất với LED nội tuyến, khung kim loại bên trong.',
    inStock: false,
  },
  {
    id: 'prod-005',
    slug: 'ugears-v-express-steam-train',
    name: 'Ugears V-Express Steam Train',
    brand: 'Ugears',
    price: 1_750_000,
    originalPrice: 1_900_000,
    rating: 4.6,
    soldCount: 1200,
    difficulty: 'medium',
    image: 'https://placehold.co/600x600/2d2d44/e0e0e0?text=Steam+Train',
    images: [
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Steam+Train+1',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Steam+Train+2',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Steam+Train+3',
    ],
    description:
      'Đầu máy hơi nước V-Express của Ugears. Có thể chạy trên ray sau khi lắp ráp. Chất liệu gỗ tự nhiên, không cần keo.',
    inStock: true,
  },
  {
    id: 'prod-006',
    slug: 'tamiya-gr-supra',
    name: 'Tamiya 1/24 Toyota GR Supra',
    brand: 'Tamiya',
    price: 750_000,
    originalPrice: 750_000,
    rating: 4.5,
    soldCount: 4500,
    difficulty: 'easy',
    image: 'https://placehold.co/600x600/3a3a5c/e0e0e0?text=GR+Supra',
    images: [
      'https://placehold.co/600x600/3a3a5c/e0e0e0?text=GR+Supra+1',
      'https://placehold.co/600x600/3a3a5c/e0e0e0?text=GR+Supra+2',
      'https://placehold.co/600x600/3a3a5c/e0e0e0?text=GR+Supra+3',
    ],
    description:
      'Mô hình xe Toyota GR Supra tỷ lệ 1/24. Dễ lắp ráp, phù hợp cho người mới bắt đầu.',
    inStock: true,
  },
  {
    id: 'prod-007',
    slug: 'sazabi-ver-ka-mg',
    name: 'Sazabi Ver.Ka MG 1/100',
    brand: 'Bandai',
    price: 2_200_000,
    originalPrice: 2_500_000,
    rating: 4.9,
    soldCount: 1560,
    difficulty: 'hard',
    image: 'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Sazabi+Ver.Ka',
    images: [
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Sazabi+1',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Sazabi+2',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Sazabi+3',
    ],
    description:
      'MSN-04 Sazabi phiên bản Ver.Ka — Master Grade. Thiết kế bởi Katoki Hajime, chi tiết vượt trội với decal nước.',
    inStock: true,
  },
  {
    id: 'prod-008',
    slug: 'ugears-amber-box',
    name: 'Ugears Amber Box Mechanical Puzzle',
    brand: 'Ugears',
    price: 890_000,
    originalPrice: 950_000,
    rating: 4.4,
    soldCount: 2100,
    difficulty: 'easy',
    image: 'https://placehold.co/600x600/2d2d44/e0e0e0?text=Amber+Box',
    images: [
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Amber+Box+1',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Amber+Box+2',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Amber+Box+3',
    ],
    description:
      'Hộp cơ khí Amber Box — puzzle bằng gỗ với cơ chế mở khóa bí ẩn. Quà tặng tuyệt vời cho người thích giải đố.',
    inStock: true,
  },
  {
    id: 'prod-009',
    slug: 'bandai-wing-zero-rg',
    name: 'Wing Gundam Zero EW RG 1/144',
    brand: 'Bandai',
    price: 680_000,
    originalPrice: 780_000,
    rating: 4.7,
    soldCount: 5600,
    difficulty: 'medium',
    image: 'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Wing+Zero+EW',
    images: [
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Wing+Zero+1',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Wing+Zero+2',
      'https://placehold.co/600x600/1a1a2e/e0e0e0?text=Wing+Zero+3',
    ],
    description:
      'Wing Gundam Zero (Endless Waltz) tỷ lệ 1/144, Real Grade. Cánh thiên thần có thể gập và mở rộng hoàn toàn.',
    inStock: true,
  },
  {
    id: 'prod-010',
    slug: 'ugears-research-vessel',
    name: 'Ugears Research Vessel',
    brand: 'Ugears',
    price: 3_200_000,
    originalPrice: 3_500_000,
    rating: 4.8,
    soldCount: 720,
    difficulty: 'expert',
    image: 'https://placehold.co/600x600/2d2d44/e0e0e0?text=Research+Vessel',
    images: [
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Research+Vessel+1',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Research+Vessel+2',
      'https://placehold.co/600x600/2d2d44/e0e0e0?text=Research+Vessel+3',
    ],
    description:
      'Tàu nghiên cứu cơ khí bằng gỗ — mô hình phức tạp nhất của Ugears với hơn 500 chi tiết. Có cơ chế chuyển động thực.',
    inStock: false,
  },
];

export function getProductBySlug(slug: string): MockProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(count = 4): MockProduct[] {
  return products
    .filter((p) => p.inStock)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

export function getAllBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))];
}
