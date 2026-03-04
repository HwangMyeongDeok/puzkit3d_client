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
  longDescription: string;
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
    longDescription: `## Night City — Marble Run đỉnh cao

**ROKR Marble Run Night City** là bộ kit marble run phức tạp và ấn tượng nhất của ROKR. Với hệ thống **LED neon** và đường ray uốn lượn, bi sẽ chạy qua thành phố lung linh.

## Đặc điểm

- **Đèn LED neon**: Chiếu sáng toàn bộ thành phố vào ban đêm
- **Cơ chế tự động**: Quay tay crank để bi chạy liên tục
- **Gỗ cắt laser**: Chính xác cao, không cần keo
- **Thời gian lắp**: Ước tính 15-20 giờ`,
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
    longDescription: `## Tàu sân bay huyền thoại

**USS Enterprise CVN-65** là tàu sân bay hạt nhân đầu tiên của Hải quân Hoa Kỳ. Mô hình Piececool tái hiện chi tiết đáng kinh ngạc.

## Đặc điểm

- **200+ mảnh kim loại**: Chi tiết cực cao
- **Boong tàu chi tiết**: Máy bay, radar, cần cẩu
- **Kim loại chống gỉ**: Bền đẹp theo thời gian
- **Đế trưng bày**: Kèm đế và biển tên`,
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
    longDescription: `## Con tàu huyền thoại Star Wars

**Millennium Falcon ICONX** — phiên bản cao cấp nhất trong dòng Metal Earth. Chi tiết gấp đôi so với phiên bản tiêu chuẩn.

## Đặc điểm

- **Dòng ICONX**: Lớn hơn, chi tiết hơn Metal Earth thường
- **Không cần keo**: Gập và gài kim loại
- **Hoàn thành nhanh**: Khoảng 3-5 giờ
- **Trung thành với phim**: Tái hiện chính xác thiết kế trong Star Wars`,
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
    longDescription: `## Địa cầu phát sáng

**ROKR Luminous Globe** kết hợp giáo dục và trang trí. Quả địa cầu bằng gỗ có thể xoay và **phát sáng nhờ LED**.

## Đặc điểm

- **LED phát sáng**: Chiếu sáng bản đồ thế giới ban đêm
- **Xoay 360°**: Có thể xoay giống địa cầu thật
- **Giáo dục**: Hiển thị các châu lục và đại dương
- **Trang trí**: Đẹp trên bàn làm việc hoặc kệ sách`,
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
    longDescription: `## Rồng vương — Kiệt tác kim loại

**Dragon King** là mô hình phức tạp nhất và đẹp nhất trong dòng Fantasy của Piececool. Hơn 300 chi tiết kim loại, cần kiên nhẫn và kỹ năng cao.

## Đặc điểm

- **300+ chi tiết**: Thách thức lớn cho modeler
- **Vảy rồng 3D**: Từng vảy được tạo hình riêng biệt
- **Đế trưng bày**: Kèm đế mây và biển tên
- **Kích thước lớn**: Cao ~20cm, sải cánh ~30cm`,
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
    longDescription: `## Tàu cướp biển huyền thoại

**Black Pearl** — con tàu của thuyền trưởng Jack Sparrow. Phiên bản Metal Earth nhỏ gọn nhưng chi tiết đáng ngạc nhiên.

## Đặc điểm

- **Nhỏ gọn**: Vừa lòng bàn tay nhưng rất chi tiết
- **Kim loại đen**: Phù hợp với tên gọi Black Pearl
- **Buồm chi tiết**: Cột buồm và dây thừng kim loại
- **Lắp nhanh**: Khoảng 2-3 giờ`,
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
    longDescription: `## Hộp nhạc Van Gogh

**Starry Night AMK51** lấy cảm hứng từ bức tranh nổi tiếng "The Starry Night" của Van Gogh. Sau khi lắp ráp, hộp nhạc sẽ **phát giai điệu thực sự**.

## Đặc điểm

- **Phát nhạc thật**: Cơ chế hộp nhạc truyền thống
- **Thiết kế nghệ thuật**: Lấy cảm hứng từ Starry Night
- **Gỗ birch cao cấp**: Bền đẹp, mùi gỗ tự nhiên
- **Thời gian lắp**: Ước tính 5-8 giờ`,
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
    longDescription: `## Kiến trúc cổ đại

**Chinese Ancient Palace** tái hiện kiến trúc cung điện triều đại nhà Thanh với **hơn 500 chi tiết kim loại**. Đây là mô hình phức tạp nhất của Piececool.

## Đặc điểm

- **500+ chi tiết**: Thách thức cho modeler cao cấp
- **Mái cong chính xác**: Tái hiện kiến trúc Trung Hoa cổ
- **Nhiều tòa nhà**: Bao gồm chính điện, cổng, hành lang
- **Thời gian lắp**: Ước tính 20-30 giờ`,
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

export function getRelatedPartnerProducts(slug: string, count = 4): PartnerProduct[] {
  const current = partnerProducts.find((p) => p.slug === slug);
  if (!current) return [];
  return partnerProducts
    .filter((p) => p.slug !== slug && (p.brand === current.brand || p.style === current.style))
    .slice(0, count);
}
