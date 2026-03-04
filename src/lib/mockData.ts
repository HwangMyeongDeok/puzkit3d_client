export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  soldCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  image: string;
  images: string[];
  description: string;
  longDescription: string;
  inStock: boolean;
}

export const products: MockProduct[] = [
  {
    id: 'prod-001',
    slug: 'rx-78-2-gundam-ver-ka',
    name: 'RX-78-2 Gundam Ver.Ka MG 1/100',
    brand: 'Bandai',
    category: 'Gundam',
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
    longDescription: `## Tổng quan

Mô hình **RX-78-2 Gundam Ver.Ka** là phiên bản Master Grade 1/100 được thiết kế bởi **Katoki Hajime** — nhà thiết kế huyền thoại của Bandai.

## Đặc điểm nổi bật

- **Khớp nối linh hoạt**: Có thể tạo nhiều tư thế chiến đấu ấn tượng
- **Decal nước cao cấp**: Đi kèm bộ decal nước chi tiết từng milimet
- **Khung nội tuyến**: Inner frame cho phép hiển thị cấu trúc bên trong
- **Vũ khí đầy đủ**: Beam Rifle, Shield, Beam Saber x2

## Thông số

| Thuộc tính | Chi tiết |
|------------|---------|
| Tỷ lệ | 1/100 (Master Grade) |
| Chiều cao | ~18cm sau lắp ráp |
| Số chi tiết | ~280 miếng |
| Chất liệu | Nhựa PS, PE, ABS |`,
    inStock: true,
  },
  {
    id: 'prod-002',
    slug: 'ugears-hurdy-gurdy',
    name: 'Ugears Hurdy-Gurdy Mechanical Model',
    brand: 'Ugears',
    category: 'Mechanical',
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
    longDescription: `## Nhạc cụ cơ khí thực sự

**Hurdy-Gurdy** là nhạc cụ cổ điển châu Âu, và Ugears đã tái hiện nó hoàn hảo bằng gỗ. Sau khi lắp ráp, bạn có thể **quay tay để phát nhạc thực sự**.

## Đặc điểm

- **Chơi nhạc thật**: Phát ra âm thanh khi quay crank
- **Không cần keo dán**: Tự khớp hoàn toàn bằng cơ chế lắp ghép
- **Gỗ tự nhiên**: Chất liệu gỗ birch cao cấp, cắt laser chính xác
- **292 chi tiết**: Thời gian lắp ráp ước tính 15-20 giờ`,
    inStock: true,
  },
  {
    id: 'prod-003',
    slug: 'tamiya-tiger-i-tank',
    name: 'Tamiya 1/35 Tiger I Tank Late Version',
    brand: 'Tamiya',
    category: 'Military',
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
    longDescription: `## Huyền thoại bọc thép

Xe tăng **Tiger I** là một trong những cỗ máy chiến tranh nổi tiếng nhất Thế chiến II. Mô hình Tamiya tái hiện phiên bản cuối với độ chính xác lịch sử cao.

## Đặc điểm

- **Chi tiết nội thất**: Buồng lái, động cơ, và tháp pháo chi tiết
- **Xích kim loại**: Đi kèm xích kim loại có thể lắp từng mắt
- **Decal chính xác**: Nhiều phương án sơn theo đơn vị thực tế
- **Tỷ lệ 1/35**: Kích thước hoàn hảo để trưng bày`,
    inStock: true,
  },
  {
    id: 'prod-004',
    slug: 'strike-freedom-gundam-pg',
    name: 'Strike Freedom Gundam PG 1/60',
    brand: 'Bandai',
    category: 'Gundam',
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
    longDescription: `## Perfect Grade — Đỉnh cao mô hình

**Strike Freedom Gundam PG 1/60** là kit cao cấp nhất trong dòng Gunpla. Với tỷ lệ 1/60 lớn và cơ chế LED tích hợp, đây là mô hình mơ ước của mọi modeler.

## Đặc điểm cao cấp

- **LED nội tuyến**: Hệ thống đèn LED chiếu sáng cockpit và mắt
- **Khung kim loại**: Inner frame kim loại cho độ cứng cáp tối đa
- **Cánh DRAGOON**: 8 cánh có thể tháo rời và gắn trên base
- **Kích thước lớn**: Cao ~33cm, ấn tượng khi trưng bày`,
    inStock: false,
  },
  {
    id: 'prod-005',
    slug: 'ugears-v-express-steam-train',
    name: 'Ugears V-Express Steam Train',
    brand: 'Ugears',
    category: 'Mechanical',
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
    longDescription: `## Đầu máy hơi nước cơ khí

**V-Express** tái hiện đầu máy hơi nước cổ điển với cơ chế chạy bằng dây cót. Sau khi lắp ráp, bạn vặn dây cót và tàu sẽ tự chạy trên ray.

## Đặc điểm

- **Tự chạy**: Cơ chế dây cót cho phép tàu chạy ~5 mét
- **Gỗ birch tự nhiên**: Cắt laser chính xác 0.1mm
- **Đi kèm ray**: Bộ kit bao gồm đường ray để tàu chạy
- **Thời gian lắp**: Ước tính 8-12 giờ`,
    inStock: true,
  },
  {
    id: 'prod-006',
    slug: 'tamiya-gr-supra',
    name: 'Tamiya 1/24 Toyota GR Supra',
    brand: 'Tamiya',
    category: 'Vehicle',
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
    longDescription: `## Siêu xe Nhật Bản

**Toyota GR Supra** — huyền thoại trở lại. Mô hình Tamiya 1/24 tái hiện chính xác thiết kế ngoại thất, nội thất và động cơ.

## Đặc điểm

- **Dễ lắp ráp**: Phù hợp cho người mới, chỉ cần keo và kéo cắt
- **Nội thất chi tiết**: Ghế, vô lăng, bảng điều khiển
- **Lốp cao su thật**: Lốp có thể xoay
- **Nhiều phương án sơn**: Trắng, đỏ, hoặc vàng`,
    inStock: true,
  },
  {
    id: 'prod-007',
    slug: 'sazabi-ver-ka-mg',
    name: 'Sazabi Ver.Ka MG 1/100',
    brand: 'Bandai',
    category: 'Gundam',
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
    longDescription: `## Sazabi — MG Ver.Ka

**MSN-04 Sazabi** là mobile suit biểu tượng của Char Aznable. Phiên bản Ver.Ka nổi tiếng với kích thước lớn và chi tiết vượt trội.

## Đặc điểm

- **Kích thước ấn tượng**: Cao ~23cm, to hơn MG bình thường
- **Decal nước Ver.Ka**: Bộ decal phong phú nhất dòng MG
- **Funnel mở**: 6 funnel có thể mở và gắn trên base
- **Khớp chắc chắn**: Khung nội tuyến cải tiến, đứng vững`,
    inStock: true,
  },
  {
    id: 'prod-008',
    slug: 'ugears-amber-box',
    name: 'Ugears Amber Box Mechanical Puzzle',
    brand: 'Ugears',
    category: 'Puzzle',
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
    longDescription: `## Hộp bí ẩn cơ khí

**Amber Box** là puzzle cơ khí bằng gỗ — bạn phải tìm cách mở khóa hộp sau khi lắp ráp xong. Quà tặng hoàn hảo!

## Đặc điểm

- **Cơ chế mở khóa**: Phải giải puzzle để mở hộp
- **Có thể đựng đồ**: Bên trong chứa được trang sức nhỏ
- **Gỗ tự nhiên**: Thiết kế trang nhã, quà tặng ý nghĩa
- **Lắp nhanh**: Chỉ 2-3 giờ, phù hợp mọi lứa tuổi`,
    inStock: true,
  },
  {
    id: 'prod-009',
    slug: 'bandai-wing-zero-rg',
    name: 'Wing Gundam Zero EW RG 1/144',
    brand: 'Bandai',
    category: 'Gundam',
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
    longDescription: `## Thiên thần trắng

**Wing Gundam Zero EW** — thiên thần của Heero Yuy. Phiên bản Real Grade nhỏ gọn nhưng chi tiết không thua Master Grade.

## Đặc điểm

- **Cánh thiên thần**: Có thể gập và mở rộng hoàn toàn
- **Real Grade**: Chi tiết cao trong tỷ lệ 1/144 nhỏ gọn
- **Twin Buster Rifle**: Vũ khí có thể tách và kết hợp
- **Giá hợp lý**: Entry-level cho người mới chơi Gunpla`,
    inStock: true,
  },
  {
    id: 'prod-010',
    slug: 'ugears-research-vessel',
    name: 'Ugears Research Vessel',
    brand: 'Ugears',
    category: 'Mechanical',
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
    longDescription: `## Tàu nghiên cứu — Flagship Ugears

**Research Vessel** là mô hình phức tạp và ấn tượng nhất của Ugears, với hơn 500 chi tiết gỗ và nhiều cơ chế chuyển động.

## Đặc điểm

- **500+ chi tiết**: Thách thức lớn nhất cho modeler
- **Cơ chế chuyển động**: Bánh lái, cánh buồm, cần cẩu hoạt động thực
- **Không cần keo**: Lắp hoàn toàn bằng cơ chế khớp nối
- **Thời gian lắp**: Ước tính 25-40 giờ`,
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

export function getRelatedProducts(slug: string, count = 4): MockProduct[] {
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];
  return products
    .filter(
      (p) => p.slug !== slug && (p.brand === current.brand || p.category === current.category)
    )
    .slice(0, count);
}
