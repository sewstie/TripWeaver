"use client";
import { X, AlertTriangle } from "lucide-react";

export default function Confirmation({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "text-red-500",
          confirmButton: "bg-red-500 hover:bg-red-600",
          border: "border-red-200",
        };
      case "info":
        return {
          icon: "text-blue-500",
          confirmButton: "bg-blue-500 hover:bg-blue-600",
          border: "border-blue-200",
        };
      default:
        return {
          icon: "text-yellow-500",
          confirmButton: "bg-yellow-500 hover:bg-yellow-600",
          border: "border-yellow-200",
        };
    }
  };

  const styles = getTypeStyles();

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="relative bg-[var(--tw-subbackground)] rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
            <h3 className="text-lg font-semibold text-[var(--tw-text)]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--tw-field)] rounded transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <div className={`border-l-4 ${styles.border} pl-4 mb-6`}>
          <p className="text-[var(--tw-text)] leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer px-4 py-2 bg-[var(--tw-field)] text-[var(--tw-text)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`cursor-pointer px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${styles.confirmButton}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
