'use client';

import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  noteLabel?: string;
  notePlaceholder?: string;
  onCancel: () => void;
  onConfirm: (note: string) => void;
};

export default function ConfirmQuotationRejectModal({
  open,
  loading = false,
  title = 'Reject quotation',
  description = 'Please enter a reason for rejecting this quotation.',
  confirmText = 'Reject quotation',
  cancelText = 'Cancel',
  noteLabel = 'Reason',
  notePlaceholder = 'Enter your reason',
  onCancel,
  onConfirm,
}: Props) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setNote('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>

        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-slate-700">{noteLabel}</label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={notePlaceholder}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition outline-none focus:border-slate-400"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
