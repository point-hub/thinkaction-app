export interface ToastOptions {
  lists?: string[]
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger'
  autoClose?: boolean
  timer?: number
}

export interface IToastRef {
  toast(message: string, options?: ToastOptions): void
}

export const toastRef = ref<IToastRef | null>(null);

export function toast(message: string, options?: ToastOptions) {
  if (toastRef.value) {
    toastRef.value.toast(message, options);
  } else {
    console.warn('[toast] Toast is not ready yet.');
  }
}
