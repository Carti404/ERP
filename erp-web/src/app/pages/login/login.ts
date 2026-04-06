import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { take } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ErpThemeService } from '../../core/theme/erp-theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly theme = inject(ErpThemeService);

  protected readonly pin = signal('');
  protected readonly maxPin = 4;

  /** Indicadores en rojo tras PIN incorrecto (se limpia al reintentar). */
  protected readonly pinError = signal(false);

  /** Dispara una vez la animación de sacudida (PIN incorrecto). */
  protected readonly shakePlay = signal(false);

  protected readonly keypad = [
    [
      { digit: '1', sub: 'abc' },
      { digit: '2', sub: 'def' },
      { digit: '3', sub: 'ghi' },
    ],
    [
      { digit: '4', sub: 'jkl' },
      { digit: '5', sub: 'mno' },
      { digit: '6', sub: 'pqr' },
    ],
    [
      { digit: '7', sub: 'stu' },
      { digit: '8', sub: 'vwx' },
      { digit: '9', sub: 'yz' },
    ],
  ] as const;

  protected readonly pinLength = computed(() => this.pin().length);

  protected readonly pinComplete = computed(() => this.pin().length === this.maxPin);

  private pinErrorClearHandle: ReturnType<typeof setTimeout> | undefined;

  private shakeResetHandle: ReturnType<typeof setTimeout> | undefined;

  /**
   * Teclado físico: dígitos, Retroceso y Enter (solo si el foco no está en un botón,
   * para no duplicar la acción al pulsar Enter sobre «Verificar identidad»).
   */
  @HostListener('window:keydown', ['$event'])
  protected onWindowKeydown(ev: KeyboardEvent): void {
    if (ev.ctrlKey || ev.metaKey || ev.altKey) {
      return;
    }

    const { key, target, repeat } = ev;

    if (/^[0-9]$/.test(key)) {
      if (repeat) {
        return;
      }
      ev.preventDefault();
      this.addDigit(key);
      return;
    }

    if (key === 'Backspace') {
      ev.preventDefault();
      this.backspace();
      return;
    }

    if (key === 'Enter') {
      if (target instanceof HTMLButtonElement) {
        return;
      }
      ev.preventDefault();
      this.verify();
    }
  }

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearPinErrorTimer();
      this.clearShakeTimer();
    });

    afterNextRender(() => {
      const s = this.auth.session();
      if (s) {
        void this.router.navigateByUrl(this.auth.homeUrlForRole(s.role));
        return;
      }

      this.theme.bindSystemPreferenceWhenUnset(this.destroyRef);
    });
  }

  private clearPinErrorTimer(): void {
    if (this.pinErrorClearHandle !== undefined) {
      clearTimeout(this.pinErrorClearHandle);
      this.pinErrorClearHandle = undefined;
    }
  }

  private clearShakeTimer(): void {
    if (this.shakeResetHandle !== undefined) {
      clearTimeout(this.shakeResetHandle);
      this.shakeResetHandle = undefined;
    }
  }

  private playPinShake(): void {
    this.clearShakeTimer();
    this.shakePlay.set(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.shakePlay.set(true);
        this.shakeResetHandle = globalThis.setTimeout(() => {
          this.shakePlay.set(false);
          this.shakeResetHandle = undefined;
        }, 500);
      });
    });
  }

  protected addDigit(d: string): void {
    this.clearPinErrorTimer();
    this.pinError.set(false);
    if (this.pin().length < this.maxPin) {
      this.pin.update((p) => p + d);
    }
  }

  protected backspace(): void {
    this.clearPinErrorTimer();
    this.pinError.set(false);
    this.pin.update((p) => p.slice(0, -1));
  }

  protected verify(): void {
    if (!this.pinComplete()) {
      return;
    }
    const pin = this.pin();
    this.auth
      .signIn(pin)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          void this.router.navigateByUrl(this.auth.homeUrlForRole(res.user.role));
        },
        error: () => {
          this.pinError.set(true);
          this.playPinShake();
          this.clearPinErrorTimer();
          this.pinErrorClearHandle = globalThis.setTimeout(() => {
            this.pin.set('');
            this.pinError.set(false);
            this.pinErrorClearHandle = undefined;
          }, 1100);
        },
      });
  }
}
