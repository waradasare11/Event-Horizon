import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface ClearHistoryConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  historyType: 'meals' | 'workouts' | 'data';
  itemCount?: number;
  isBatchDelete?: boolean;
  selectedItemTitles?: string[];
}

export const ClearHistoryConfirmModal: React.FC<ClearHistoryConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  historyType,
  itemCount = 0,
  isBatchDelete = false,
  selectedItemTitles = [],
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const itemTypeName = historyType === 'meals' ? 'meal log' : historyType === 'workouts' ? 'workout session' : 'entry';
  const itemTypePlural = historyType === 'meals' ? 'meal logs' : historyType === 'workouts' ? 'workout sessions' : 'entries';

  const typeLabel = isBatchDelete
    ? `Delete ${itemCount} Selected ${itemTypePlural.charAt(0).toUpperCase() + itemTypePlural.slice(1)}`
    : historyType === 'meals'
    ? 'Clear Meal & Nutrition History'
    : historyType === 'workouts'
    ? 'Clear Workout & Training History'
    : 'Clear User History Data';

  const isDeleteConfirmed = confirmationInput.trim() === 'DELETE';

  const handleConfirm = () => {
    if (!isDeleteConfirmed) {
      setErrorMessage('Please type DELETE in all caps to confirm.');
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <div
      id="clear-history-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="clear-history-modal-content"
        className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900/50 p-6 overflow-hidden"
      >
        {/* Close Button */}
        <button
          id="clear-history-modal-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="clear-history-modal-title"
              className="text-lg font-bold text-zinc-900 dark:text-white leading-snug"
            >
              {isBatchDelete ? `${typeLabel}?` : `${typeLabel}?`}
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider">
              {isBatchDelete ? 'Batch Delete Action' : 'Irreversible Action'}
            </p>
          </div>
        </div>

        {/* Warning details */}
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 space-y-1.5 mb-5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p>
              This will permanently delete <strong>{itemCount} selected {itemCount === 1 ? itemTypeName : itemTypePlural}</strong> from your local storage and cloud database.
            </p>
          </div>
          {selectedItemTitles.length > 0 && (
            <div className="pl-6 pt-1 text-[11px] text-rose-800 dark:text-rose-300">
              <span className="font-semibold">Selected items:</span>{' '}
              {selectedItemTitles.slice(0, 3).join(', ')}
              {selectedItemTitles.length > 3 ? ` and ${selectedItemTitles.length - 3} more` : ''}
            </div>
          )}
          <p className="pl-6 text-rose-700 dark:text-rose-300 font-medium">
            To prevent accidental data loss, please confirm this bulk deletion below.
          </p>
        </div>

        {/* Type DELETE Input */}
        <div className="space-y-2 mb-6">
          <label
            htmlFor="delete-confirm-input"
            className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Type <span className="font-mono font-bold text-rose-600 dark:text-rose-400">DELETE</span> to confirm:
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={confirmationInput}
            onChange={(e) => {
              setConfirmationInput(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="DELETE"
            autoComplete="off"
            spellCheck="false"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-mono text-sm tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all placeholder:text-zinc-400"
          />
          {errorMessage && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMessage}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            id="clear-history-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            id="clear-history-modal-confirm-btn"
            type="button"
            onClick={handleConfirm}
            disabled={!isDeleteConfirmed}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
              isDeleteConfirmed
                ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 cursor-pointer shadow-rose-600/20'
                : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {isBatchDelete ? `Delete ${itemCount} Selected` : 'Clear Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};
