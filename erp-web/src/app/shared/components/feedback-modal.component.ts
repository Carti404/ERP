import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../core/services/feedback.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toasts Container -->
    @if (fb.toast().show) {
    <div class="erp-worker-toast" [attr.data-variant]="fb.toast().type">
      <span class="erp-worker-toast__icon material-symbols-outlined">
        {{ getToastIcon(fb.toast().type) }}
      </span>
      <div class="erp-worker-toast__text">
        {{ fb.toast().message }}
      </div>
    </div>
    }

    <!-- Generic Modal Overlay -->
    @if (fb.modal().show) {
    <div class="fixed inset-0 z-[110] flex items-center justify-center bg-[#051125]/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div class="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 dark:bg-[#1a1f2e]">
        <div class="p-6 text-center">
          <!-- Icon Header -->
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors"
            [ngClass]="getModalBgClass(fb.modal().type)">
            <span class="material-symbols-outlined text-3xl" [ngClass]="getModalTextClass(fb.modal().type)">
              {{ getModalIcon(fb.modal().type) }}
            </span>
          </div>

          <h3 class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
            {{ fb.modal().title }}
          </h3>
          <p class="mt-2 text-sm text-slate-500 leading-relaxed px-2">
            {{ fb.modal().message }}
          </p>

          <!-- Optional Input for Prompt -->
          @if (fb.modal().showInput) {
            <div class="mt-4 px-2">
              <textarea 
                [(ngModel)]="promptValue"
                [placeholder]="fb.modal().inputPlaceholder"
                rows="3"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:border-[#47607e] focus:outline-none dark:border-slate-800 dark:bg-slate-900/40 dark:text-white"
              ></textarea>
            </div>
          }

          <!-- Actions -->
          <div class="mt-8 flex gap-3">
            <button type="button" (click)="fb.closeModal(false)"
              class="flex-1 rounded-2xl border-2 border-slate-100 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-500">
              {{ fb.modal().cancelLabel }}
            </button>
            <button type="button" (click)="confirmModal()"
              class="flex-2 rounded-2xl bg-[#47607e] px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-90">
              {{ fb.modal().confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .animate-in {
      animation-duration: 0.25s;
    }
  `]
})
export class FeedbackModalComponent {
  protected readonly fb = inject(FeedbackService);
  protected promptValue = '';

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  getModalIcon(type: string): string {
    switch (type) {
      case 'success': return 'verified';
      case 'error': return 'cancel';
      case 'warning': return 'report';
      default: return 'help';
    }
  }

  getModalBgClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-100 dark:bg-emerald-900/20';
      case 'error': return 'bg-rose-100 dark:bg-rose-900/20';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/20';
      default: return 'bg-slate-100 dark:bg-slate-800/40';
    }
  }

  getModalTextClass(type: string): string {
    switch (type) {
      case 'success': return 'text-emerald-600';
      case 'error': return 'text-rose-600';
      case 'warning': return 'text-amber-600';
      default: return 'text-slate-600';
    }
  }

  confirmModal() {
    this.fb.closeModal(true, this.promptValue);
    this.promptValue = ''; // reset
  }
}
