// src/components/ConfirmationModal.tsx

"use client";

import React from "react";
import { X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative transform transition-all sm:my-8 sm:w-full">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            onClick={onCancel}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-sm text-gray-700">{message}</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md shadow-sm hover:bg-gray-300 transition-colors duration-300"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 transition-colors duration-300"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
