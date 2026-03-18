import Link from 'next/link';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';

export default function OrderSuccessPage() {
  return (
    <div className="container-custom flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="bg-success/20 absolute -inset-4 rounded-full blur-xl" />
        <div className="bg-success/10 relative flex h-24 w-24 items-center justify-center rounded-full">
          <CheckCircle className="text-success h-14 w-14" />
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">Đặt hàng thành công!</h1>

      <p className="text-muted-foreground mx-auto mb-2 max-w-md">
        Cảm ơn bạn đã mua hàng. Mã đơn hàng của bạn là{' '}
        <span className="text-brand font-bold">#PK-84920</span>. Chúng tôi sẽ gửi email xác nhận
        trong thời gian sớm nhất.
      </p>

      <div className="border-border bg-card my-6 inline-flex items-center gap-3 rounded-xl border px-6 py-4">
        <Package className="text-brand h-5 w-5" />
        <div className="text-left">
          <p className="text-muted-foreground text-xs">Mã đơn hàng</p>
          <p className="text-card-foreground text-lg font-bold">#PK-84920</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link href={ROUTES.PRODUCTS}>
          <Button size="lg" className="gap-2 rounded-xl px-8">
            Khám phá thêm mô hình
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={ROUTES.HOME}>
          <Button variant="outline" size="lg" className="gap-2 rounded-xl px-8">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
