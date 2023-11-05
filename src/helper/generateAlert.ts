import { toast, ToastOptions } from 'react-toastify';

type Type = 'success' | 'error' | 'info' | 'warning';

export default function generateAlert(message: string, type?: Type) {
  const options: ToastOptions = {
    position: 'top-right',
    autoClose: 5000,
    // autoClose: false,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    theme: 'light'
  };
  return type ? toast[type](message, options) : toast(message, options);
}
