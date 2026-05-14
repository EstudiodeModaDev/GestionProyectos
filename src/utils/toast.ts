import { toast, type ToastOptions } from "react-toastify";

const DEFAULT_OPTIONS: ToastOptions = {
  position: "top-right",
  closeOnClick: true,
  pauseOnHover: true,
};

export function showSuccess(message: string, options?: ToastOptions) {
  return toast.success(message, { ...DEFAULT_OPTIONS, ...options });
}

export function showError(message: string, options?: ToastOptions) {
  return toast.error(message, { ...DEFAULT_OPTIONS, autoClose: 6000, ...options });
}

export function showWarning(message: string, options?: ToastOptions) {
  return toast.warning(message, { ...DEFAULT_OPTIONS, autoClose: 5000, ...options });
}

export function showInfo(message: string, options?: ToastOptions) {
  return toast.info(message, { ...DEFAULT_OPTIONS, ...options });
}
