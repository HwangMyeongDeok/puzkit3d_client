import { APP_CONFIG } from '@/constants/config';

export function formatPrice(price: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat(APP_CONFIG.CURRENCY_LOCALE, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: APP_CONFIG.CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  return formatted;
}

export function formatDate(date: string | Date, includeTime: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: APP_CONFIG.TIMEZONE,
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = false;
  }

  return new Intl.DateTimeFormat('vi-VN', options).format(d);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return formatDate(d);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }

  return phone;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function formatBuildTime(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${remainingMinutes} phút`;
}
