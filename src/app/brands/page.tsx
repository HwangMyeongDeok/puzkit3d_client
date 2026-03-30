'use client';

import { useMemo, useEffect, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/lib/hooks/useDebounce';
import PartnerProductCard from '@/components/custom/PartnerProductCard';
import PartnerProductFilterSidebar from '@/components/custom/PartnerProductFilterSidebar';

import {
  useGetPartnerProductsQuery,
  type PartnerProductListItem,
} from '@/lib/api/endpoints/partnerProductApi';
import { useGetPartnersQuery } from '@/lib/api/endpoints/partnerApi';
import { useGetImportServiceConfigsSelectQuery } from '@/lib/api/endpoints/importServiceConfigApi';

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [configSearch, setConfigSearch] = useState('');
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<string[]>([]);
  const [selectedConfigIds, setSelectedConfigIds] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const {
    data: productResponse,
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError: productsError,
    error: productsErrorObj,
  } = useGetPartnerProductsQuery({
    pageNumber: 1,
    pageSize: 100,
    searchTerm: debouncedSearch || undefined,
  });

  const {
    data: partnerResponse,
    isLoading: partnersLoading,
    isError: partnersError,
    error: partnersErrorObj,
  } = useGetPartnersQuery({
    pageNumber: 1,
    pageSize: 100,
  });

  const {
    data: configResponse,
    isLoading: configsLoading,
    isError: configsError,
    error: configsErrorObj,
  } = useGetImportServiceConfigsSelectQuery();

  const allPartners = partnerResponse?.items ?? [];
  const allConfigs = configResponse ?? [];
  const rawProducts = productResponse?.items ?? [];

  const partnerMap = useMemo(() => {
    return new Map(allPartners.map((partner) => [partner.id, partner]));
  }, [allPartners]);

  const configMap = useMemo(() => {
    return new Map(allConfigs.map((config) => [config.id, config]));
  }, [allConfigs]);

  const partnerNameById = useMemo(() => {
    const map = new Map<string, string>();

    for (const partner of allPartners) {
      map.set(partner.id, partner.name);
    }

    return map;
  }, [allPartners]);

  const partnerDebugErrors = useMemo(() => {
    const errors: Array<{
      productId: string;
      productName: string;
      partnerId: string;
      availablePartnerIds: string[];
    }> = [];

    for (const product of rawProducts) {
      const partnerName = partnerNameById.get(product.partnerId);

      if (!partnerName) {
        errors.push({
          productId: product.id,
          productName: product.name,
          partnerId: product.partnerId,
          availablePartnerIds: Array.from(partnerNameById.keys()),
        });
      }
    }

    return errors;
  }, [rawProducts, partnerNameById]);

  useEffect(() => {
    if (partnerDebugErrors.length > 0) {
      console.warn('[BrandsPage] Partner mapping errors:', partnerDebugErrors);
    } else if (rawProducts.length > 0) {
      console.log('[BrandsPage] Partner mapping OK');
    }
  }, [partnerDebugErrors, rawProducts.length]);
  useEffect(() => {
    console.log('[BrandsPage] partnerResponse:', partnerResponse);
    console.log('[BrandsPage] allPartners:', allPartners);
  }, [partnerResponse, allPartners]);
  <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
    <div className="font-semibold">Partner response debug</div>
    <pre className="mt-2 text-xs whitespace-pre-wrap">
      {JSON.stringify(partnerResponse, null, 2)}
    </pre>
  </div>;
  const allProducts: PartnerProductListItem[] = useMemo(() => {
    return rawProducts.map((product) => ({
      ...product,
      partnerName: partnerNameById.get(product.partnerId) || '',
    }));
  }, [rawProducts, partnerNameById]);

  const filteredPartnersForSearch = useMemo(() => {
    const keyword = partnerSearch.trim().toLowerCase();
    if (!keyword) return allPartners;

    return allPartners.filter((partner) =>
      [partner.name, partner.description, partner.address]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(keyword))
    );
  }, [allPartners, partnerSearch]);

  const filteredConfigsForSearch = useMemo(() => {
    const keyword = configSearch.trim().toLowerCase();
    if (!keyword) return allConfigs;

    return allConfigs.filter((config) =>
      [config.countryName, config.countryCode]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(keyword))
    );
  }, [allConfigs, configSearch]);

  const enabledConfigIds = useMemo(() => {
    if (allPartners.length === 0) {
      return new Set(allConfigs.map((config) => config.id));
    }

    if (selectedPartnerIds.length === 0) {
      return new Set(allPartners.map((partner) => partner.importServiceConfigId));
    }

    return new Set(
      allPartners
        .filter((partner) => selectedPartnerIds.includes(partner.id))
        .map((partner) => partner.importServiceConfigId)
    );
  }, [allPartners, allConfigs, selectedPartnerIds]);

  const enabledPartnerIds = useMemo(() => {
    if (selectedConfigIds.length === 0) {
      return new Set(allPartners.map((partner) => partner.id));
    }

    return new Set(
      allPartners
        .filter((partner) => selectedConfigIds.includes(partner.importServiceConfigId))
        .map((partner) => partner.id)
    );
  }, [allPartners, selectedConfigIds]);

  const finalProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const partner = partnerMap.get(product.partnerId);

      const matchPartner =
        selectedPartnerIds.length === 0 || selectedPartnerIds.includes(product.partnerId);

      if (selectedConfigIds.length === 0) {
        return matchPartner;
      }

      if (!partner) return false;

      const matchConfig = selectedConfigIds.includes(partner.importServiceConfigId);

      return matchPartner && matchConfig;
    });
  }, [allProducts, partnerMap, selectedPartnerIds, selectedConfigIds]);

  const activeCountryNames = useMemo(() => {
    return selectedConfigIds
      .map((id) => configMap.get(id)?.countryName)
      .filter(Boolean) as string[];
  }, [selectedConfigIds, configMap]);

  const togglePartner = (partnerId: string) => {
    setSelectedPartnerIds((prev) =>
      prev.includes(partnerId) ? prev.filter((id) => id !== partnerId) : [...prev, partnerId]
    );
  };

  const toggleConfig = (configId: string) => {
    setSelectedConfigIds((prev) =>
      prev.includes(configId) ? prev.filter((id) => id !== configId) : [...prev, configId]
    );
  };

  const clearAll = () => {
    setSelectedPartnerIds([]);
    setSelectedConfigIds([]);
    setPartnerSearch('');
    setConfigSearch('');
  };

  const isLoading = productsLoading || partnersLoading || configsLoading;
  const isFetching = productsFetching;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="max-w-3xl">
            <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-amber-600 uppercase">
              Exclusive Partner Collections
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Browse Partner Products
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Find imported products by partner and country, then submit a quote request.
            </p>
          </div>

          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name..."
              className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-sm shadow-none"
            />
          </div>

          {(selectedPartnerIds.length > 0 || activeCountryNames.length > 0) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPartnerIds.map((partnerId) => {
                const partner = partnerMap.get(partnerId);
                if (!partner) return null;

                return (
                  <span
                    key={partnerId}
                    className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                  >
                    {partner.name}
                  </span>
                );
              })}

              {activeCountryNames.map((country) => (
                <span
                  key={country}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {country}
                </span>
              ))}
            </div>
          )}
        </div>

        {(partnersError || configsError || productsError) && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold">API debug</div>
            <pre className="mt-2 text-xs whitespace-pre-wrap">
              {JSON.stringify(
                {
                  partnersError: partnersErrorObj ?? null,
                  configsError: configsErrorObj ?? null,
                  productsError: productsErrorObj ?? null,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {partnerDebugErrors.length > 0 && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="font-semibold">Partner mapping debug</div>

            <div className="mt-3 space-y-3">
              {partnerDebugErrors.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-xl border border-amber-200 bg-white p-3"
                >
                  <div>
                    <b>Product:</b> {item.productName}
                  </div>
                  <div>
                    <b>Product ID:</b> {item.productId}
                  </div>
                  <div>
                    <b>Partner ID from product:</b> {item.partnerId}
                  </div>
                  <div className="mt-1 break-all">
                    <b>Available partner IDs:</b> {item.availablePartnerIds.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <PartnerProductFilterSidebar
            partnerSearch={partnerSearch}
            configSearch={configSearch}
            selectedPartnerIds={selectedPartnerIds}
            selectedConfigIds={selectedConfigIds}
            partners={filteredPartnersForSearch}
            configs={filteredConfigsForSearch}
            enabledConfigIds={enabledConfigIds}
            enabledPartnerIds={enabledPartnerIds}
            onPartnerSearchChange={setPartnerSearch}
            onConfigSearchChange={setConfigSearch}
            onTogglePartner={togglePartner}
            onToggleConfig={toggleConfig}
            onClearAll={clearAll}
          />

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Products</h2>
                <p className="text-sm text-slate-500">
                  Showing {finalProducts.length} product{finalProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[360px] animate-pulse rounded-2xl border bg-white"
                  />
                ))}
              </div>
            ) : finalProducts.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try changing the selected partner, country, or search keyword.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {finalProducts.map((product) => {
                  const partner = allPartners.find((item) => item.id === product.partnerId);
                  const config = partner ? configMap.get(partner.importServiceConfigId) : undefined;

                  return (
                    <PartnerProductCard
                      key={product.id}
                      product={product}
                      partnerName={product.partnerName || ''}
                      countryName={config?.countryName}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
