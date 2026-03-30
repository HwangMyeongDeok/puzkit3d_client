const S3_BASE_URL = (process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL || '').replace(/\/+$/, '');

const FALLBACK_IMAGE = '/images/product-placeholder.png';

export function normalizeAssetUrl(value?: string | null) {
  if (!value) return FALLBACK_IMAGE;

  const trimmed = value.trim();
  if (!trimmed || trimmed === 'string') return FALLBACK_IMAGE;

  if (/^blob:/i.test(trimmed)) return trimmed;

  const firstHttpIndex = trimmed.indexOf('http');
  const normalized = firstHttpIndex > 0 ? trimmed.slice(firstHttpIndex) : trimmed;

  if (/^https?:\/\//i.test(normalized)) {
    const secondHttpIndex = normalized.indexOf('http', 8);
    return secondHttpIndex > 0 ? normalized.slice(secondHttpIndex) : normalized;
  }

  if (!S3_BASE_URL) {
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }

  return `${S3_BASE_URL}/${normalized.replace(/^\/+/, '')}`;
}

export function normalizeAssetList(values?: Array<string | null | undefined>) {
  return (values || [])
    .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
    .map((item) => normalizeAssetUrl(item));
}
