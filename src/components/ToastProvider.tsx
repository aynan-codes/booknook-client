"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

type ToastType = "success" | "error";

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
};

export default function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3500);
    },
    []
  );

  // Show toast after login redirect
  useEffect(() => {
    const message = sessionStorage.getItem("loginToast");

    if (message) {
      showToast(message, "success");
      sessionStorage.removeItem("loginToast");
    }
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`flex items-center gap-3 rounded-xl px-5 py-4 text-white shadow-xl ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <span className="text-xl">
              {toast.type === "success" ? "✓" : "✕"}
            </span>

            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

