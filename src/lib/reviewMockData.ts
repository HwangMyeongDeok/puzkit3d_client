export interface MockReview {
  id: string;
  productId: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export const reviews: MockReview[] = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    userName: 'Minh Tuấn',
    avatar: 'https://placehold.co/40x40/4a90d9/ffffff?text=MT',
    rating: 5,
    date: '2025-12-15',
    comment:
      'Kit RX-78-2 Ver.Ka rất đẹp, chi tiết cực kỳ sắc nét. Decal nước dán lên rất bắt mắt. Đóng gói cẩn thận.',
  },
  {
    id: 'rev-002',
    productId: 'prod-001',
    userName: 'Hoàng Anh',
    avatar: 'https://placehold.co/40x40/e74c3c/ffffff?text=HA',
    rating: 4,
    date: '2025-11-28',
    comment: 'Mô hình đẹp nhưng khớp vai hơi lỏng. Nhìn chung vẫn rất đáng mua cho fan Gundam.',
  },
  {
    id: 'rev-003',
    productId: 'prod-001',
    userName: 'Thanh Hà',
    avatar: 'https://placehold.co/40x40/2ecc71/ffffff?text=TH',
    rating: 5,
    date: '2025-10-05',
    comment: 'Lần đầu chơi MG, rất hài lòng. Hướng dẫn rõ ràng, lắp khoảng 8 tiếng là xong.',
  },
  {
    id: 'rev-004',
    productId: 'prod-002',
    userName: 'Đức Phúc',
    avatar: 'https://placehold.co/40x40/f39c12/ffffff?text=DP',
    rating: 5,
    date: '2025-12-20',
    comment:
      'Hurdy-Gurdy phát nhạc thật sự! Lắp hơi khó nhưng kết quả xứng đáng. Quà tặng tuyệt vời.',
  },
  {
    id: 'rev-005',
    productId: 'prod-002',
    userName: 'Ngọc Linh',
    avatar: 'https://placehold.co/40x40/9b59b6/ffffff?text=NL',
    rating: 5,
    date: '2025-11-10',
    comment: 'Mua tặng chồng, anh ấy mê lắm. Lắp mất 3 ngày cuối tuần nhưng rất thú vị.',
  },
  {
    id: 'rev-006',
    productId: 'prod-003',
    userName: 'Văn Hùng',
    avatar: 'https://placehold.co/40x40/1abc9c/ffffff?text=VH',
    rating: 4,
    date: '2025-12-01',
    comment: 'Chi tiết rất tốt cho tỷ lệ 1/35. Xích kim loại lắp hơi mệt nhưng trông rất thực.',
  },
  {
    id: 'rev-007',
    productId: 'prod-003',
    userName: 'Quang Minh',
    avatar: 'https://placehold.co/40x40/e67e22/ffffff?text=QM',
    rating: 5,
    date: '2025-09-22',
    comment: 'Tamiya luôn là số 1 về quân sự. Tiger I này fit hoàn hảo, không cần chỉnh gì.',
  },
  {
    id: 'rev-008',
    productId: 'prod-005',
    userName: 'Bảo Ngọc',
    avatar: 'https://placehold.co/40x40/3498db/ffffff?text=BN',
    rating: 4,
    date: '2025-11-15',
    comment: 'Tàu hơi nước chạy được thật. Con trai tôi rất thích. Gỗ đẹp, thơm mùi gỗ tự nhiên.',
  },
  {
    id: 'rev-009',
    productId: 'prod-007',
    userName: 'Trí Dũng',
    avatar: 'https://placehold.co/40x40/e74c3c/ffffff?text=TD',
    rating: 5,
    date: '2025-12-25',
    comment: 'Sazabi Ver.Ka xứng đáng rating 5 sao. To, đẹp, chắc. Kit MG tốt nhất tôi từng làm.',
  },
  {
    id: 'rev-010',
    productId: 'prod-007',
    userName: 'Phương Thảo',
    avatar: 'https://placehold.co/40x40/2ecc71/ffffff?text=PT',
    rating: 5,
    date: '2025-10-30',
    comment: 'Mua cho bạn trai, cậu ấy lắp 2 tuần mới xong nhưng kết quả cực đẹp.',
  },
  {
    id: 'rev-011',
    productId: 'prod-009',
    userName: 'Hải Đăng',
    avatar: 'https://placehold.co/40x40/f39c12/ffffff?text=HD',
    rating: 4,
    date: '2025-11-05',
    comment: 'Wing Zero RG nhỏ nhưng chi tiết bất ngờ. Cánh thiên thần là điểm nhấn. Giá hợp lý.',
  },
  {
    id: 'rev-012',
    productId: 'prod-009',
    userName: 'Kim Ngân',
    avatar: 'https://placehold.co/40x40/9b59b6/ffffff?text=KN',
    rating: 5,
    date: '2025-08-18',
    comment: 'Kit RG đầu tiên của tôi, rất hài lòng. Nhỏ gọn nhưng trông rất premium.',
  },
  {
    id: 'rev-013',
    productId: 'prod-006',
    userName: 'Anh Khoa',
    avatar: 'https://placehold.co/40x40/1abc9c/ffffff?text=AK',
    rating: 5,
    date: '2025-12-10',
    comment: 'GR Supra dễ lắp, đẹp. Lần đầu làm mô hình xe, rất phù hợp cho beginners.',
  },
  {
    id: 'rev-014',
    productId: 'prod-008',
    userName: 'Thùy Linh',
    avatar: 'https://placehold.co/40x40/e67e22/ffffff?text=TL',
    rating: 4,
    date: '2025-09-14',
    comment: 'Amber Box xinh xắn, mua tặng bạn gái rất hợp. Cơ chế mở khóa thú vị.',
  },
  {
    id: 'rev-015',
    productId: 'partner-001',
    userName: 'Công Thành',
    avatar: 'https://placehold.co/40x40/4a90d9/ffffff?text=CT',
    rating: 5,
    date: '2025-12-28',
    comment:
      'ROKR Night City quá đẹp, bi chạy mượt. LED sáng lung linh ban đêm. Worth every penny.',
  },
  {
    id: 'rev-016',
    productId: 'partner-005',
    userName: 'Hoàng Yến',
    avatar: 'https://placehold.co/40x40/e74c3c/ffffff?text=HY',
    rating: 5,
    date: '2025-11-20',
    comment: 'Dragon King Piececool siêu chi tiết. Mất 2 ngày để lắp nhưng kết quả breathtaking.',
  },
  {
    id: 'rev-017',
    productId: 'partner-003',
    userName: 'Minh Quân',
    avatar: 'https://placehold.co/40x40/3498db/ffffff?text=MQ',
    rating: 4,
    date: '2025-10-12',
    comment: 'Millennium Falcon Metal Earth nhỏ nhưng rất tinh xảo. Khó hơn tôi nghĩ.',
  },
];

export function getReviewsByProductId(productId: string): MockReview[] {
  return reviews.filter((r) => r.productId === productId);
}

export function getAverageRating(productId: string): { average: number; count: number } {
  const productReviews = getReviewsByProductId(productId);
  if (productReviews.length === 0) return { average: 0, count: 0 };
  const total = productReviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Math.round((total / productReviews.length) * 10) / 10,
    count: productReviews.length,
  };
}

export function getRatingDistribution(productId: string): Record<number, number> {
  const productReviews = getReviewsByProductId(productId);
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  productReviews.forEach((r) => {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  });
  return dist;
}
