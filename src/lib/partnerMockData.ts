export interface PartnerProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  estimatedPrice: number;
  style: string;
  rating: number;
  image: string;
  images: string[];
  description: string;
}

export const partnerProducts: PartnerProduct[] = [
  {
    id: 'partner-001',
    slug: 'rokr-marble-run-night-city',
    name: 'ROKR Marble Run Night City 3D Wooden Puzzle',
    brand: 'ROKR',
    estimatedPrice: 1_850_000,
    style: 'Mechanical',
    rating: 4.8,
    image: 'https://placehold.co/600x600/2a2a45/f0c040?text=ROKR+Night+City',
    images: [
      'https://placehold.co/600x600/2a2a45/f0c040?text=Night+City+1',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Night+City+2',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Night+City+3',
    ],
    description:
      'Mô hình gỗ 3D ROKR Marble Run Night City với đèn LED. Bi chạy tự động qua các đường ray phức tạp.',
  },
  {
    id: 'partner-002',
    slug: 'piececool-uss-enterprise',
    name: 'Piececool USS Enterprise CVN-65 Metal Model',
    brand: 'Piececool',
    estimatedPrice: 2_400_000,
    style: 'Military',
    rating: 4.9,
    image: 'https://placehold.co/600x600/1e3a5f/e0e0e0?text=USS+Enterprise',
    images: [
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Enterprise+1',
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Enterprise+2',
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Enterprise+3',
    ],
    description:
      'Mô hình kim loại tàu sân bay USS Enterprise CVN-65 siêu chi tiết. Hơn 200 mảnh ghép kim loại.',
  },
  {
    id: 'partner-003',
    slug: 'metal-earth-iconx-millennium-falcon',
    name: 'Metal Earth ICONX Millennium Falcon',
    brand: 'Metal Earth',
    estimatedPrice: 980_000,
    style: 'Sci-Fi',
    rating: 4.7,
    image: 'https://placehold.co/600x600/333355/e0e0e0?text=Millennium+Falcon',
    images: [
      'https://placehold.co/600x600/333355/e0e0e0?text=Falcon+1',
      'https://placehold.co/600x600/333355/e0e0e0?text=Falcon+2',
      'https://placehold.co/600x600/333355/e0e0e0?text=Falcon+3',
    ],
    description:
      'Mô hình kim loại Millennium Falcon dòng ICONX cao cấp. Chi tiết cực cao, không cần keo dán.',
  },
  {
    id: 'partner-004',
    slug: 'rokr-luminous-globe',
    name: 'ROKR Luminous Globe ST003 Wooden Puzzle',
    brand: 'ROKR',
    estimatedPrice: 1_600_000,
    style: 'Educational',
    rating: 4.6,
    image: 'https://placehold.co/600x600/2a2a45/f0c040?text=Luminous+Globe',
    images: [
      'https://placehold.co/600x600/2a2a45/f0c040?text=Globe+1',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Globe+2',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Globe+3',
    ],
    description:
      'Quả địa cầu bằng gỗ phát sáng ROKR ST003. Vừa là mô hình trang trí vừa mang tính giáo dục.',
  },
  {
    id: 'partner-005',
    slug: 'piececool-dragon-king',
    name: 'Piececool Dragon King Metal Puzzle',
    brand: 'Piececool',
    estimatedPrice: 3_100_000,
    style: 'Fantasy',
    rating: 4.9,
    image: 'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Dragon+King',
    images: [
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Dragon+1',
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Dragon+2',
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Dragon+3',
    ],
    description:
      'Rồng vương kim loại Piececool — mô hình phức tạp nhất dòng Fantasy. Hơn 300 chi tiết với đế trưng bày.',
  },
  {
    id: 'partner-006',
    slug: 'metal-earth-black-pearl',
    name: 'Metal Earth Black Pearl Pirate Ship',
    brand: 'Metal Earth',
    estimatedPrice: 750_000,
    style: 'Fantasy',
    rating: 4.5,
    image: 'https://placehold.co/600x600/333355/e0e0e0?text=Black+Pearl',
    images: [
      'https://placehold.co/600x600/333355/e0e0e0?text=Pearl+1',
      'https://placehold.co/600x600/333355/e0e0e0?text=Pearl+2',
      'https://placehold.co/600x600/333355/e0e0e0?text=Pearl+3',
    ],
    description:
      'Tàu cướp biển Black Pearl bằng kim loại. Thiết kế nhỏ gọn, phù hợp để trưng bày trên bàn làm việc.',
  },
  {
    id: 'partner-007',
    slug: 'rokr-music-box-starry-night',
    name: 'ROKR Music Box Starry Night AMK51',
    brand: 'ROKR',
    estimatedPrice: 1_250_000,
    style: 'Mechanical',
    rating: 4.7,
    image: 'https://placehold.co/600x600/2a2a45/f0c040?text=Starry+Night',
    images: [
      'https://placehold.co/600x600/2a2a45/f0c040?text=Starry+1',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Starry+2',
      'https://placehold.co/600x600/2a2a45/f0c040?text=Starry+3',
    ],
    description:
      'Hộp nhạc gỗ Starry Night ROKR AMK51. Phát nhạc thực sự sau khi lắp ráp, lấy cảm hứng từ Van Gogh.',
  },
  {
    id: 'partner-008',
    slug: 'piececool-chinese-palace',
    name: 'Piececool Chinese Ancient Palace',
    brand: 'Piececool',
    estimatedPrice: 4_200_000,
    style: 'Architecture',
    rating: 4.8,
    image: 'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Chinese+Palace',
    images: [
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Palace+1',
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Palace+2',
      'https://placehold.co/600x600/1e3a5f/e0e0e0?text=Palace+3',
    ],
    description:
      'Cung điện cổ Trung Quốc bằng kim loại. Mô hình kiến trúc phức tạp nhất của Piececool với hơn 500 chi tiết.',
  },
];

export function getPartnerBrands(): string[] {
  return [...new Set(partnerProducts.map((p) => p.brand))];
}

export function getPartnerStyles(): string[] {
  return [...new Set(partnerProducts.map((p) => p.style))];
}

export function getPartnerProductBySlug(slug: string): PartnerProduct | undefined {
  return partnerProducts.find((p) => p.slug === slug);
}
