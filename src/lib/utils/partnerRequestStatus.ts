export const PARTNER_REQUEST_STATUS = {
  PENDING: 0,
  CANCELLED_BY_STAFF: 1,
  APPROVED: 2,
  QUOTED: 4,
  ACCEPTED: 5,
  REJECTED_BY_CUSTOMER: 6,
  CANCELLED_BY_CUSTOMER: 7,
} as const;

export const PARTNER_QUOTATION_STATUS = {
  CANCELLED_BY_STAFF: 1,
  QUOTED: 4,
  ACCEPTED: 5,
  REJECTED_BY_CUSTOMER: 6,
  CANCELLED_BY_CUSTOMER: 7,
} as const;

type StatusMeta = {
  label: string;
  className: string;
};

function normalizePartnerRequestStatus(status?: number | string | null) {
  if (status === null || status === undefined) return undefined;
  if (typeof status === 'number') return status;

  const normalized = status.toString().trim().toLowerCase();

  if (normalized === 'pending') return PARTNER_REQUEST_STATUS.PENDING;
  if (normalized === 'cancelledbystaff') return PARTNER_REQUEST_STATUS.CANCELLED_BY_STAFF;
  if (normalized === 'approved') return PARTNER_REQUEST_STATUS.APPROVED;
  if (normalized === 'quoted') return PARTNER_REQUEST_STATUS.QUOTED;
  if (normalized === 'accepted') return PARTNER_REQUEST_STATUS.ACCEPTED;
  if (normalized === 'rejectedbycustomer') return PARTNER_REQUEST_STATUS.REJECTED_BY_CUSTOMER;
  if (normalized === 'cancelledbycustomer') return PARTNER_REQUEST_STATUS.CANCELLED_BY_CUSTOMER;

  return status;
}

function normalizePartnerQuotationStatus(status?: number | string | null) {
  if (status === null || status === undefined) return undefined;
  if (typeof status === 'number') return status;

  const normalized = status.toString().trim().toLowerCase();

  if (normalized === 'cancelledbystaff') return PARTNER_QUOTATION_STATUS.CANCELLED_BY_STAFF;
  if (normalized === 'quoted') return PARTNER_QUOTATION_STATUS.QUOTED;
  if (normalized === 'accepted') return PARTNER_QUOTATION_STATUS.ACCEPTED;
  if (normalized === 'rejectedbycustomer') return PARTNER_QUOTATION_STATUS.REJECTED_BY_CUSTOMER;
  if (normalized === 'cancelledbycustomer') return PARTNER_QUOTATION_STATUS.CANCELLED_BY_CUSTOMER;

  return status;
}

export function getPartnerRequestStatusMeta(status?: number | string | null): StatusMeta {
  const value = normalizePartnerRequestStatus(status);

  switch (value) {
    case PARTNER_REQUEST_STATUS.PENDING:
      return {
        label: 'Pending',
        className: 'bg-amber-50 text-amber-700 border border-amber-200',
      };
    case PARTNER_REQUEST_STATUS.CANCELLED_BY_STAFF:
      return {
        label: 'Cancelled by Staff',
        className: 'bg-rose-50 text-rose-700 border border-rose-200',
      };
    case PARTNER_REQUEST_STATUS.APPROVED:
      return {
        label: 'Approved',
        className: 'bg-blue-50 text-blue-700 border border-blue-200',
      };
    case PARTNER_REQUEST_STATUS.QUOTED:
      return {
        label: 'Quoted',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };
    case PARTNER_REQUEST_STATUS.ACCEPTED:
      return {
        label: 'Accepted',
        className: 'bg-green-50 text-green-700 border border-green-200',
      };
    case PARTNER_REQUEST_STATUS.REJECTED_BY_CUSTOMER:
      return {
        label: 'Rejected by Customer',
        className: 'bg-red-50 text-red-700 border border-red-200',
      };
    case PARTNER_REQUEST_STATUS.CANCELLED_BY_CUSTOMER:
      return {
        label: 'Cancelled by Customer',
        className: 'bg-slate-100 text-slate-700 border border-slate-200',
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-slate-100 text-slate-700 border border-slate-200',
      };
  }
}

export function getPartnerQuotationStatusMeta(status?: number | string | null): StatusMeta {
  const value = normalizePartnerQuotationStatus(status);

  switch (value) {
    case PARTNER_QUOTATION_STATUS.CANCELLED_BY_STAFF:
      return {
        label: 'Cancelled by Staff',
        className: 'bg-rose-50 text-rose-700 border border-rose-200',
      };
    case PARTNER_QUOTATION_STATUS.QUOTED:
      return {
        label: 'Quoted',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      };
    case PARTNER_QUOTATION_STATUS.ACCEPTED:
      return {
        label: 'Accepted',
        className: 'bg-green-50 text-green-700 border border-green-200',
      };
    case PARTNER_QUOTATION_STATUS.REJECTED_BY_CUSTOMER:
      return {
        label: 'Rejected by Customer',
        className: 'bg-red-50 text-red-700 border border-red-200',
      };
    case PARTNER_QUOTATION_STATUS.CANCELLED_BY_CUSTOMER:
      return {
        label: 'Cancelled by Customer',
        className: 'bg-slate-100 text-slate-700 border border-slate-200',
      };
    default:
      return {
        label: 'Unknown',
        className: 'bg-slate-100 text-slate-700 border border-slate-200',
      };
  }
}
