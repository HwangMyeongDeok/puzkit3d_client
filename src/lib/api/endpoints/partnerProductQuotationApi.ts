import { apiSlice } from '../apiSlice';

export interface PartnerQuotationDetailItem {
  id: string;
  partnerProductId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface PartnerQuotationDetail {
  id: string;
  code: string;
  partnerProductRequestId: string;
  subTotalAmount: number;
  shippingFee: number;
  importTaxAmount: number;
  grandTotalAmount: number;
  note?: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
  details?: PartnerQuotationDetailItem[];
}

export interface CreatePartnerQuotationItemBody {
  partnerProductId: string;
  customUnitPrice: number;
}

export interface CreatePartnerQuotationBody {
  partnerProductRequestId: string;
  partnerId: string;
  expectedDeliveryDate: string;
  items: CreatePartnerQuotationItemBody[];
}

export interface CreatePartnerQuotationResponse {
  quotationId: string;
}

export interface UpdatePartnerQuotationStatusBody {
  id: string;
  newStatus: number;
  note?: string;
}

export const partnerProductQuotationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerQuotationByRequestId: builder.query<PartnerQuotationDetail, string>({
      query: (requestId) => ({
        url: `/partner-quotations/by-request/${requestId}`,
        method: 'GET',
      }),
    }),

    getPartnerQuotationById: builder.query<PartnerQuotationDetail, string>({
      query: (id) => ({
        url: `/partner-quotations/${id}`,
        method: 'GET',
      }),
    }),

    createPartnerQuotation: builder.mutation<
      CreatePartnerQuotationResponse,
      CreatePartnerQuotationBody
    >({
      query: (data) => ({
        url: '/partner-quotations',
        method: 'POST',
        data,
      }),
    }),

    updatePartnerQuotationStatus: builder.mutation<unknown, UpdatePartnerQuotationStatusBody>({
      query: ({ id, ...data }) => ({
        url: `/partner-quotations/${id}/status`,
        method: 'PUT',
        data,
      }),
    }),
  }),
});

export const {
  useGetPartnerQuotationByRequestIdQuery,
  useGetPartnerQuotationByIdQuery,
  useCreatePartnerQuotationMutation,
  useUpdatePartnerQuotationStatusMutation,
} = partnerProductQuotationApi;
