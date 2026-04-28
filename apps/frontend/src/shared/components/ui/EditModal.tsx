import React, { useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formId: string;
  isSaving: boolean;
  isSaved: boolean;
  isUploading?: boolean;
  onDelete?: () => void;
  deleteLabel?: string;
  children: React.ReactNode;
}

export function EditModal({
  isOpen,
  onClose,
  title,
  formId,
  isSaving,
  isSaved,
  isUploading = false,
  onDelete,
  deleteLabel = 'Delete Account',
  children,
}: EditModalProps) {
  useEffect(() => {
    if (isSaved) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [isSaved, onClose]);

  if (!isOpen) return null;

  const busy = isSaving || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0 rounded-b-2xl">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {deleteLabel}
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form={formId}
              disabled={busy || isSaved}
              className={`min-w-[120px] px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2
                ${isSaved
                  ? 'bg-green-500 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70'
                }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
