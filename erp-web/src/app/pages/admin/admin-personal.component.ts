import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { messageFromApiError } from '../../core/http/api-error.util';
import { UsersApiService } from '../../core/users/users-api.service';
import type {
  CreateUserPayload,
  ErpUserPublic,
  UpdateUserPayload,
} from '../../core/users/users-api.types';

@Component({
  selector: 'app-admin-personal',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './admin-personal.component.html',
})
export class AdminPersonalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UsersApiService);

  protected readonly pageSize = 5;

  protected readonly workers = signal<ErpUserPublic[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly modalOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly pinServerError = signal<string | null>(null);

  protected readonly confirmDeactivateOpen = signal(false);
  protected readonly deactivateTarget = signal<ErpUserPublic | null>(null);
  protected readonly deactivating = signal(false);
  protected readonly deactivateError = signal<string | null>(null);

  protected readonly searchQuery = signal('');
  protected readonly roleFilter = signal<'' | 'admin' | 'worker'>('');
  protected readonly currentPage = signal(0);

  protected readonly workerModalTitle = computed(() =>
    this.editingId() ? 'Editar trabajador' : 'Añadir trabajador',
  );

  protected readonly workerModalSubtitle = computed(() =>
    this.editingId()
      ? 'Modifica los datos; el PIN solo se actualiza si escribes uno nuevo de 4 dígitos.'
      : 'Asigna un PIN de 4 dígitos; no puede repetirse entre usuarios activos.',
  );

  protected readonly workerSubmitLabel = computed(() =>
    this.editingId() ? 'Guardar cambios' : 'Guardar',
  );

  protected readonly isEditMode = computed(() => this.editingId() !== null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(64)]],
    fullName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
    email: ['', [Validators.email, Validators.maxLength(255)]],
    puesto: ['', [Validators.maxLength(120)]],
    role: ['worker' as 'admin' | 'worker', [Validators.required]],
    pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
  });

  protected readonly filteredWorkers = computed(() => {
    let list = this.workers();
    const role = this.roleFilter();
    if (role) {
      list = list.filter((w) => w.role === role);
    }
    const q = this.normalizeText(this.searchQuery());
    if (q) {
      list = list.filter(
        (w) =>
          this.normalizeText(w.fullName).includes(q) ||
          this.normalizeText(w.username).includes(q),
      );
    }

    return [...list].sort((a, b) =>
      a.fullName.localeCompare(b.fullName, 'es-MX', { sensitivity: 'base' }),
    );
  });

  protected readonly totalPages = computed(() => {
    const n = this.filteredWorkers().length;
    return Math.max(1, Math.ceil(n / this.pageSize));
  });

  protected readonly pagedWorkers = computed(() => {
    const list = this.filteredWorkers();
    const page = this.currentPage();
    const start = page * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  protected readonly paginationFrom = computed(() => {
    const n = this.filteredWorkers().length;
    if (n === 0) {
      return 0;
    }
    return this.currentPage() * this.pageSize + 1;
  });

  protected readonly paginationTo = computed(() => {
    const n = this.filteredWorkers().length;
    return Math.min((this.currentPage() + 1) * this.pageSize, n);
  });

  protected readonly hasPrevPage = computed(() => this.currentPage() > 0);

  protected readonly hasNextPage = computed(
    () => this.currentPage() < this.totalPages() - 1,
  );

  protected readonly emptyTableMessage = computed(() => {
    if (this.workers().length === 0) {
      return 'Aún no hay trabajadores registrados.';
    }
    return 'Ningún trabajador coincide con la búsqueda o el filtro de rol.';
  });

  constructor() {
    effect(() => {
      const n = this.filteredWorkers().length;
      const totalPages = Math.max(1, Math.ceil(n / this.pageSize));
      const maxIdx = totalPages - 1;
      if (this.currentPage() > maxIdx) {
        this.currentPage.set(maxIdx);
      }
    });
  }

  ngOnInit(): void {
    this.loadWorkers();
    this.form.controls.pin.valueChanges.subscribe(() => {
      this.pinServerError.set(null);
    });
  }

  private readonly optionalFourDigitPin = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const v = (control.value ?? '').toString().trim();
    if (v === '') {
      return null;
    }
    return /^\d{4}$/.test(v) ? null : { pattern: true };
  };

  private applyPinValidators(editMode: boolean): void {
    const pinCtrl = this.form.controls.pin;
    if (editMode) {
      pinCtrl.setValidators([this.optionalFourDigitPin]);
    } else {
      pinCtrl.setValidators([
        Validators.required,
        Validators.pattern(/^\d{4}$/),
      ]);
    }
    pinCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private normalizeText(s: string): string {
    return s
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  protected onSearchInput(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
    this.currentPage.set(0);
  }

  protected onRoleFilterChange(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    if (raw === 'admin' || raw === 'worker') {
      this.roleFilter.set(raw);
    } else {
      this.roleFilter.set('');
    }
    this.currentPage.set(0);
  }

  protected goPrevPage(): void {
    this.currentPage.update((p) => Math.max(0, p - 1));
  }

  protected goNextPage(): void {
    const max = this.totalPages() - 1;
    this.currentPage.update((p) => Math.min(max, p + 1));
  }

  protected get kpiTotal(): string {
    return String(this.workers().length);
  }

  protected get kpiActive(): string {
    return String(this.workers().filter((w) => w.activo).length);
  }

  protected initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  protected roleBadgeClass(w: ErpUserPublic): string {
    const base = 'rounded px-2 py-1 text-[10px] font-bold uppercase';
    if (w.role === 'admin') {
      return `${base} bg-[#1b263b] text-white`;
    }
    if (!w.activo) {
      return `${base} bg-[#e1e3e4] text-[#45474d] dark:bg-[var(--erp-login-input-border)] dark:text-[var(--erp-login-muted)]`;
    }
    return `${base} bg-[#e7e8e9] text-[#3c475d] dark:bg-[var(--erp-login-surface)] dark:text-[var(--erp-login-text-primary)]`;
  }

  protected onAddWorker(): void {
    this.editingId.set(null);
    this.applyPinValidators(false);
    this.form.reset({
      username: '',
      fullName: '',
      email: '',
      puesto: '',
      role: 'worker',
      pin: '',
    });
    this.formError.set(null);
    this.pinServerError.set(null);
    this.modalOpen.set(true);
  }

  protected onRowEdit(w: ErpUserPublic): void {
    this.editingId.set(w.id);
    this.applyPinValidators(true);
    this.form.reset({
      username: w.username,
      fullName: w.fullName,
      email: w.email ?? '',
      puesto: w.puesto ?? '',
      role: w.role,
      pin: '',
    });
    this.formError.set(null);
    this.pinServerError.set(null);
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
    this.applyPinValidators(false);
    this.submitting.set(false);
    this.formError.set(null);
    this.pinServerError.set(null);
  }

  private handleSaveError(err: unknown, editing: boolean): void {
    const status = (err as { status?: number }).status;
    const msg = messageFromApiError(err);
    const fallback = editing
      ? 'No se pudieron guardar los cambios.'
      : 'No se pudo crear el trabajador.';
    if (status === 409) {
      const m = msg ?? '';
      const isPinConflict =
        m.includes('PIN') || m.toLowerCase().includes('el pin');
      if (isPinConflict) {
        this.pinServerError.set(
          msg ?? 'El PIN ya está en uso; intenta con otro.',
        );
      } else {
        this.formError.set(
          msg ?? 'No se pudo completar la operación (dato duplicado).',
        );
      }
      return;
    }
    if (status === 400 && msg) {
      this.formError.set(msg);
      return;
    }
    this.formError.set(msg ?? fallback);
  }

  protected submitWorker(): void {
    this.formError.set(null);
    this.pinServerError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const editId = this.editingId();

    this.submitting.set(true);

    if (editId) {
      const body: UpdateUserPayload = {
        username: v.username.trim(),
        fullName: v.fullName.trim(),
        role: v.role,
        email: v.email.trim() ? v.email.trim() : null,
        puesto: v.puesto.trim() ? v.puesto.trim() : null,
      };
      const pinTrim = v.pin.trim();
      if (pinTrim) {
        body.pin = pinTrim;
      }
      this.usersApi.update(editId, body).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadWorkers();
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          this.handleSaveError(err, true);
        },
      });
      return;
    }

    const payload: CreateUserPayload = {
      username: v.username.trim(),
      fullName: v.fullName.trim(),
      pin: v.pin,
      role: v.role,
    };
    const emailTrim = v.email.trim();
    if (emailTrim) {
      payload.email = emailTrim;
    }
    const puestoTrim = v.puesto.trim();
    if (puestoTrim) {
      payload.puesto = puestoTrim;
    }

    this.usersApi.create(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeModal();
        this.loadWorkers();
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.handleSaveError(err, false);
      },
    });
  }

  protected loadWorkers(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.usersApi.list().subscribe({
      next: (rows) => {
        this.workers.set(rows);
        this.currentPage.set(0);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el personal.');
        this.loading.set(false);
      },
    });
  }

  protected onFilter(): void {
    return;
  }

  protected openDeactivateConfirm(w: ErpUserPublic): void {
    this.deactivateError.set(null);
    this.deactivateTarget.set(w);
    this.confirmDeactivateOpen.set(true);
  }

  protected closeDeactivateConfirm(): void {
    if (this.deactivating()) {
      return;
    }
    this.confirmDeactivateOpen.set(false);
    this.deactivateTarget.set(null);
    this.deactivateError.set(null);
  }

  protected confirmDeactivate(): void {
    const w = this.deactivateTarget();
    if (!w) {
      return;
    }
    this.deactivateError.set(null);
    this.deactivating.set(true);
    this.usersApi.deactivate(w.id).subscribe({
      next: () => {
        this.deactivating.set(false);
        this.confirmDeactivateOpen.set(false);
        this.deactivateTarget.set(null);
        this.loadWorkers();
      },
      error: (err: unknown) => {
        this.deactivating.set(false);
        this.deactivateError.set(
          messageFromApiError(err) ?? 'No se pudo dar de baja al trabajador.',
        );
      },
    });
  }

  protected onReactivate(w: ErpUserPublic): void {
    this.usersApi.reactivate(w.id).subscribe({
      next: () => this.loadWorkers(),
      error: () => {
        this.loadError.set('No se pudo reactivar al trabajador.');
      },
    });
  }

  protected onRowDeactivate(w: ErpUserPublic): void {
    this.openDeactivateConfirm(w);
  }
}
