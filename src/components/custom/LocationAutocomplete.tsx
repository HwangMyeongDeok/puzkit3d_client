'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Option = {
  code: number | string;
  name: string;
};

type Props = {
  label: string;
  value: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export default function LocationAutocomplete({
  label,
  value,
  options,
  placeholder,
  disabled,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    const keyword = normalizeText(value);

    const matched = !keyword
      ? options
      : options.filter((item) => {
          const name = normalizeText(item.name);
          return name.includes(keyword) || keyword.includes(name);
        });

    return matched.slice(0, 6);
  }, [options, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef}>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>

      <div className="relative">
        <input
          value={value}
          onFocus={() => !disabled && setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!disabled) setOpen(true);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-2xl border px-4 py-3 pr-11 outline-none focus:border-slate-900 disabled:bg-slate-100"
        />

        <button
          type="button"
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && !disabled && (
          <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-xl">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onChange(item.name);
                    setOpen(false);
                  }}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  {item.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">No matching result</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
