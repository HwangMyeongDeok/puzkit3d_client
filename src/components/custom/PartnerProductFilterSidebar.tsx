'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { PartnerDto } from '@/lib/api/endpoints/partnerApi';
import type { ImportServiceConfigSelectItem } from '@/lib/api/endpoints/importServiceConfigApi';

type Props = {
  partnerSearch: string;
  configSearch: string;
  selectedPartnerIds: string[];
  selectedConfigIds: string[];
  partners: PartnerDto[];
  configs: ImportServiceConfigSelectItem[];
  enabledConfigIds: Set<string>;
  enabledPartnerIds: Set<string>;
  onPartnerSearchChange: (value: string) => void;
  onConfigSearchChange: (value: string) => void;
  onTogglePartner: (partnerId: string) => void;
  onToggleConfig: (configId: string) => void;
  onClearAll: () => void;
};

export default function PartnerProductFilterSidebar({
  partnerSearch,
  configSearch,
  selectedPartnerIds,
  selectedConfigIds,
  partners,
  configs,
  enabledConfigIds,
  enabledPartnerIds,
  onPartnerSearchChange,
  onConfigSearchChange,
  onTogglePartner,
  onToggleConfig,
  onClearAll,
}: Props) {
  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">Filters</h2>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 text-xs">
            <X className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Partner</h3>

            <div className="relative mb-3">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={partnerSearch}
                onChange={(e) => onPartnerSearchChange(e.target.value)}
                placeholder="Search partner..."
                className="pl-9"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {partners.map((partner) => {
                const checked = selectedPartnerIds.includes(partner.id);
                const enabled = enabledPartnerIds.has(partner.id) || checked;

                return (
                  <label
                    key={partner.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 transition ${
                      checked
                        ? 'border-amber-500 bg-amber-50'
                        : enabled
                          ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-45'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!enabled}
                      onChange={() => onTogglePartner(partner.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{partner.name}</p>
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {partner.description || partner.address || 'No description'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Country / Config</h3>

            <div className="relative mb-3">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={configSearch}
                onChange={(e) => onConfigSearchChange(e.target.value)}
                placeholder="Search country..."
                className="pl-9"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {configs.map((config) => {
                const checked = selectedConfigIds.includes(config.id);
                const enabled = enabledConfigIds.has(config.id) || checked;

                return (
                  <label
                    key={config.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                      checked
                        ? 'border-amber-500 bg-amber-50'
                        : enabled
                          ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-45'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!enabled}
                      onChange={() => onToggleConfig(config.id)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{config.countryName}</p>
                      <p className="text-muted-foreground text-xs">Code: {config.countryCode}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
