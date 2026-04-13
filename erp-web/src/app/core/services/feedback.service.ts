import { Injectable, signal } from '@angular/core';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  message: string;
  type: FeedbackType;
  show: boolean;
}

export interface ModalState {
  show: boolean;
  title: string;
  message: string;
  type: FeedbackType;
  confirmLabel: string;
  cancelLabel: string;
  showInput?: boolean;
  inputValue?: string;
  inputPlaceholder?: string;
  resolve?: (result: { confirmed: boolean; value?: string }) => void;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  readonly toast = signal<ToastState>({ message: '', type: 'info', show: false });
  readonly modal = signal<ModalState>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    confirmLabel: 'Aceptar',
    cancelLabel: 'Cancelar'
  });

  private toastTimeout?: any;

  showToast(message: string, type: FeedbackType = 'success', duration = 3000) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    
    this.toast.set({ message, type, show: true });
    
    this.toastTimeout = setTimeout(() => {
      this.toast.update(t => ({ ...t, show: false }));
    }, duration);
  }

  showConfirm(title: string, message: string, type: FeedbackType = 'info'): Promise<boolean> {
    return new Promise((resolve) => {
      this.modal.set({
        show: true,
        title,
        message,
        type,
        confirmLabel: 'Confirmar',
        cancelLabel: 'Cancelar',
        resolve: (res) => resolve(res.confirmed)
      });
    });
  }

  showPrompt(title: string, message: string, placeholder = 'Escribe aquí...'): Promise<string | null> {
    return new Promise((resolve) => {
      this.modal.set({
        show: true,
        title,
        message,
        type: 'info',
        confirmLabel: 'Enviar',
        cancelLabel: 'Cancelar',
        showInput: true,
        inputPlaceholder: placeholder,
        inputValue: '',
        resolve: (res) => resolve(res.confirmed ? res.value || '' : null)
      });
    });
  }

  closeModal(confirmed: boolean, value?: string) {
    const current = this.modal();
    if (current.resolve) {
      current.resolve({ confirmed, value });
    }
    this.modal.update(m => ({ ...m, show: false }));
  }
}
