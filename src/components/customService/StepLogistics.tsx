import { DollarSign, Calendar, Info } from 'lucide-react';
import type { ConfiguratorState } from './types';

interface StepLogisticsProps {
  config: ConfiguratorState;
  updateConfig: (updates: Partial<ConfiguratorState>) => void;
}

export default function StepLogistics({ config, updateConfig }: StepLogisticsProps) {
  const getMinDate = () => {
    const minDateObj = new Date();
    minDateObj.setDate(minDateObj.getDate() + 7);

    const year = minDateObj.getFullYear();
    const month = String(minDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(minDateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const minAllowedDate = getMinDate();

  return (
    <div className="animate-in fade-in mx-auto max-w-3xl space-y-10 duration-500">
      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-[#032a63] md:text-4xl">
          Order Details & Timeline
        </h2>
        <p className="text-lg text-slate-600">
          Finalize your manufacturing scale, budget, and deadline.
        </p>
      </div>

      {/* 1. Number of Models / Quantity */}
      <div className="space-y-4">
        <label className="block text-sm font-bold tracking-wider text-slate-400 uppercase">
          1. Order Quantity (Number of Models)
        </label>

        <div className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex-1">
            <span className="block text-xl font-bold text-[#032a63]">
              How many items do you need?
            </span>
            <span className="mt-1 block text-sm text-slate-500">
              Input the total quantity for this manufacturing run.
            </span>
          </div>
          <div className="w-1/3">
            <input
              type="text"
              placeholder="e.g. 50"
              value={config.quantity ? Number(config.quantity).toLocaleString('en-US') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                updateConfig({ quantity: rawValue ? Number(rawValue) : '' });
              }}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-4 text-center text-xl font-black text-[#032a63] shadow-inner transition-all focus:border-[#032a63] focus:ring-1 focus:ring-[#032a63] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2 & 3. Budget & Delivery Date */}
      <div className="mt-8 grid grid-cols-1 gap-8 border-t border-slate-200 pt-4 md:grid-cols-2">
        {/* Budget (VND) */}
        <div className="space-y-4">
          <label className="block text-sm font-bold tracking-wider text-slate-400 uppercase">
            2. Target Budget (VND)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="VD: 5,000,000"
              value={config.budget ? Number(config.budget).toLocaleString('en-US') : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                updateConfig({ budget: rawValue ? Number(rawValue) : '' });
              }}
              // Đổi pl-10 thành pl-4 (bỏ khoảng trống bên trái) và pr-4 thành pr-16 (tạo khoảng trống bên phải cho chữ VND)
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 pr-16 pl-4 font-bold text-[#032a63] shadow-sm transition-all focus:border-[#032a63] focus:ring-1 focus:ring-[#032a63] focus:outline-none"
            />
            {/* Chuyển span sang right-4 */}
            <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400">
              VND
            </span>
          </div>
        </div>

        {/* Delivery Date */}
        <div className="space-y-4">
          <label className="block text-sm font-bold tracking-wider text-slate-400 uppercase">
            3. Desired Delivery Date
          </label>
          <div className="relative">
            <Calendar
              className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="date"
              min={minAllowedDate}
              value={config.deliveryDate || ''}
              onChange={(e) => updateConfig({ deliveryDate: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-200 bg-white py-4 pr-4 pl-12 font-bold text-[#032a63] shadow-sm transition-all focus:border-[#032a63] focus:ring-1 focus:ring-[#032a63] focus:outline-none"
            />
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#032a63]" />
            <p>
              Please allow at least <strong>7 days</strong> from today for standard manufacturing
              and quality assurance processing.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-12 flex justify-between border-t border-slate-200 pt-8">
        <button
          onClick={() => updateConfig({ step: 3 })}
          className="flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-[#032a63] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => updateConfig({ step: 5 })}
          disabled={!config.quantity || !config.budget || !config.deliveryDate}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#032a63] px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#021744] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
        >
          Review Order
        </button>
      </div>
    </div>
  );
}
