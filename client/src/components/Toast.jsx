import { createContext, useContext, useState, useCallback, useId } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={twMerge(
              'flex items-start p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-8 duration-300',
              t.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
              t.type === 'error' && 'bg-red-50 border-red-200 text-red-800',
              t.type === 'warning' && 'bg-amber-50 border-amber-200 text-amber-800',
              t.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800'
            )}
          >
            <div className="flex-shrink-0 mr-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 font-medium text-sm pt-0.5">{t.message}</div>
            <button onClick={() => removeToast(t.id)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
