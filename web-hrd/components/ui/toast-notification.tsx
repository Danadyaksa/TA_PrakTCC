"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-4 duration-300",
        type === "success"
          ? "bg-white border-green-200 text-green-800"
          : "bg-white border-red-200 text-red-800"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 size={18} className="text-green-500 shrink-0" />
      ) : (
        <XCircle size={18} className="text-red-500 shrink-0" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    </div>
  );
}

// Hook untuk pakai toast
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastComponent };
}
