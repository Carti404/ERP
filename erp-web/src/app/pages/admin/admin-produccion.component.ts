import { DecimalPipe } from '@angular/common';
import { Component, computed, signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ProductionService, ProductionTask, ProductionProcess, WasteReport } from '../../core/services/production.service';
import { UsersApiService } from '../../core/users/users-api.service';
import { map } from 'rxjs';

export type AdminProduccionTab = 'req' | 'asig' | 'sup';

@Component({
  selector: 'app-admin-produccion',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  templateUrl: './admin-produccion.component.html',
})
export class AdminProduccionComponent {
  private productionService = inject(ProductionService);
  private usersService = inject(UsersApiService);

  private rawProductionTasks = toSignal(this.productionService.getPendingProduction(), { initialValue: [] });
  private rawMtProducts = toSignal(this.productionService.getMtProduceableProducts(), { initialValue: [] });
  private rawWorkers = toSignal(this.usersService.list().pipe(
    map(users => users.filter(u => u.role === 'worker' && u.activo))
  ), { initialValue: [] });

  protected readonly filterMode = signal<'all' | 'assigned' | 'history'>('all');
  protected readonly historyPage = signal(1);
  protected readonly historyLimit = 10;

  // ──── FILTRO PARA PROCESOS ────
  protected readonly processFilterMode = signal<'sin_procesos' | 'con_procesos'>('sin_procesos');

  protected readonly requirements = computed(() => {
    const tasks = this.rawProductionTasks();
    const mode = this.filterMode();
    
    let filtered = tasks;
    if (mode === 'all') {
      filtered = tasks.filter(t => t.status !== 'REPORTED_TO_MT');
    } else if (mode === 'assigned') {
      filtered = tasks.filter(t => t.status !== 'DRAFT' && t.status !== 'REPORTED_TO_MT');
    } else if (mode === 'history') {
      filtered = tasks.filter(t => t.status === 'REPORTED_TO_MT');
    }

    return filtered.map(task => {
      const isCompleted = task.status === 'COMPLETED';
      const isReported = task.status === 'REPORTED_TO_MT';
      
      // Calcular tiempo real de producción para historial
      let realDurationLabel = '';
      if (isReported && task.assignments && task.assignments.length > 0) {
        realDurationLabel = this.calculateRealDuration(task);
      }

      return {
        id: task.id,
        productId: task.productId,
        name: task.productName,
        sku: `Orden: ${task.orderNumber || 'S/F'}`,
        qtyLabel: `${task.quantityToProduce} unidades`,
        quantityToProduce: task.quantityToProduce,
        deadline: 'Por asignar',
        deadlineTone: task.status === 'DRAFT' ? 'urgent' as const : 'ok' as const,
        delegationPct: task.status === 'DRAFT' ? 0 : 100,
        delegationLabel: task.status === 'DRAFT' ? 'Pendiente' : isReported ? 'Reportada a MT' : (isCompleted ? 'Completada' : 'Asignado'),
        isAssigned: task.status !== 'DRAFT',
        isCompleted,
        isReportedToMT: isReported,
        recipe: task.recipe,
        processCount: task.processes?.length || 0,
        status: task.status,
        totalEstimatedTimeValue: task.totalEstimatedTimeValue || 0,
        totalEstimatedTimeUnit: task.totalEstimatedTimeUnit || 'minutes',
        realDurationLabel,
      };
    });
  });

  /** Órdenes filtradas para la pestaña de Procesos */
  protected readonly processOrders = computed(() => {
    const tasks = this.rawProductionTasks();
    const mode = this.processFilterMode();

    // Excluir las ya reportadas a MT del listado de procesos
    const pending = tasks.filter(t => t.status !== 'REPORTED_TO_MT');

    if (mode === 'sin_procesos') {
      return pending.filter(t => !t.processes || t.processes.length === 0);
    } else {
      return pending.filter(t => t.processes && t.processes.length > 0);
    }
  });

  protected readonly paginatedRequirements = computed(() => {
    const items = this.requirements();
    if (this.filterMode() !== 'history') return items;

    const start = (this.historyPage() - 1) * this.historyLimit;
    return items.slice(start, start + this.historyLimit);
  });

  protected readonly totalHistoryPages = computed(() => {
    const all = this.requirements().filter(r => r.status === 'REPORTED_TO_MT');
    return Math.ceil(all.length / this.historyLimit) || 1;
  });

  protected setFilter(mode: 'all' | 'assigned' | 'history'): void {
    this.filterMode.set(mode);
    this.historyPage.set(1);
    this.selectedTask.set(null);
  }

  protected changeHistoryPage(delta: number): void {
    const next = this.historyPage() + delta;
    if (next >= 1 && next <= this.totalHistoryPages()) {
      this.historyPage.set(next);
      this.selectedTask.set(null);
    }
  }

  protected readonly recipe = computed(() => {
    const t = this.selectedTask();
    if (!t || !t.recipe) return [];
    // Transformamos los items de la receta para el listado
    return t.recipe.items?.map((item: any, idx: number) => ({
      n: idx + 1,
      name: item.productName || item.product?.name || 'Insumo',
      type: item.itemType || item.product?.itemType || 'n1',
      quantity: (Number(item.quantityPerUnit) || 0) * (Number(t.quantityToProduce) || 0),
      unit: item.unitOfMeasure || item.product?.unitOfMeasure || ''
    })) || [];
  });

  protected readonly delegationOps = computed(() => {
    return this.rawWorkers().map(w => ({
      id: w.id,
      name: w.fullName,
      puesto: w.puesto || 'Trabajador'
    }));
  });

  protected readonly availableWorkers = computed(() => {
    const selected = this.selectedWorkerIds();
    return this.delegationOps();
  });

  protected readonly selectedDelegationWorkers = computed(() => {
    const selected = this.selectedWorkerIds();
    const ops = this.delegationOps();
    return selected.map(id => {
      const w = ops.find(o => o.id === id);
      return {
        id,
        name: w?.name || '?',
        puesto: w?.puesto || '?'
      };
    });
  });

  protected readonly delegationTarget = computed(() => {
    return Number(this.selectedTask()?.quantityToProduce) || 0;
  });

  protected readonly delegationTotal = computed(() => {
    const q = this.delegationQty();
    const selected = this.selectedWorkerIds();
    return selected.reduce((s: number, id: string) => s + (Number(q[id]) || 0), 0);
  });

  protected readonly delegationBalanced = computed(
    () => Number(this.delegationTotal()) === Number(this.delegationTarget()),
  );

  protected readonly delegationErrorMessage = computed(() => {
    const total = Number(this.delegationTotal());
    const target = Number(this.delegationTarget());
    if (total === target) return null;
    if (total > target) return `Exceso de ${total - target} unidades`;
    return `Faltan ${target - total} unidades`;
  });

  protected readonly canConfirmDelegation = computed(() => {
    return this.delegationBalanced() && this.selectedWorkerIds().length > 0;
  });


  protected readonly supervision: any[] = [];
  protected readonly asignaciones: any[] = [];


  protected readonly activeTab = signal<AdminProduccionTab>('req');

  protected readonly selectedTask = signal<ProductionTask | null>(null);
  protected readonly selectedWorkerIds = signal<string[]>([]);

  
  // Lógica de cancelación
  protected showCancelModal = signal<boolean>(false);
  protected taskToCancel = signal<string | null>(null);

  // ──── PROCESOS ────
  protected readonly processSelectedTask = signal<ProductionTask | null>(null);
  protected readonly taskProcesses = signal<ProductionProcess[]>([]);
  protected readonly processFormRows = signal<{ orderIndex: number; name: string; description: string; estimatedTimeValue: number; estimatedTimeUnit: string }[]>([]);
  protected readonly savingProcesses = signal(false);
  protected readonly showDeleteProcessModal = signal(false);
  protected readonly showSuccessModal = signal(false);
  protected readonly successModalConfig = signal({ title: '', message: '' });
  protected readonly processToDeleteIndex = signal<number | null>(null);

  // ──── TIEMPO TOTAL ESTIMADO ────
  protected readonly totalEstimatedTimeValue = signal(0);
  protected readonly totalEstimatedTimeUnit = signal('minutes');
  protected readonly showTotalTimeModal = signal(false);
  protected readonly showDelegationConfirmModal = signal(false);

  // ──── MERMAS ────
  protected readonly wasteReports = signal<WasteReport[]>([]);
  protected readonly loadingWaste = signal(false);

  // ──── REPORTE A MT ────
  protected readonly reportingToMT = signal<string | null>(null);

  // ──── DELEGACIÓN MODALS ────
  protected readonly isAssigning = signal(false);

  protected onSelectTask(id: string): void {
    const task = this.rawProductionTasks().find(t => t.id === id);
    if (task) {
      this.selectedTask.set(task);
      // Resetear estado de delegación al cambiar de tarea
      this.selectedWorkerIds.set([]);
      this.delegationQty.set({});
    }
  }


  private readonly delegationQty = signal<Record<string, number>>({});


  protected selectTab(tab: AdminProduccionTab): void {
    this.activeTab.set(tab);
    if (tab === 'sup') {
      this.loadWaste();
    }
    // Limpiar notificaciones de "sin procesos" cuando entra a la tab de Procesos
    if (tab === 'asig') {
      this.productionService.clearNoProcessNotifications().subscribe({
        next: () => {},
        error: () => {},
      });
    }
  }

  protected tabClass(tab: AdminProduccionTab): string {
    const active = this.activeTab() === tab;
    return active
      ? 'border-b-2 border-[#47607e] pb-1 text-white'
      : 'text-[#47607e] transition-colors hover:text-white';
  }

  protected onDelegationInput(id: string, raw: string): void {
    const n = Math.max(0, Math.floor(Number(raw.replace(/,/g, '')) || 0));
    this.delegationQty.update((prev) => ({ ...prev, [id]: n }));
  }

  protected addWorkerToDelegation(workerId: string): void {
    if (!workerId) return;
    const current = this.selectedWorkerIds();
    if (!current.includes(workerId)) {
      this.selectedWorkerIds.update(ids => [...ids, workerId]);
    }
  }

  protected removeWorkerFromDelegation(workerId: string): void {
    this.selectedWorkerIds.update(ids => ids.filter(id => id !== workerId));
    this.delegationQty.update(prev => {
      const next = { ...prev };
      delete next[workerId];
      return next;
    });
  }

  protected delegationInputValue(id: string): number {
    return this.delegationQty()[id] ?? 0;
  }


  protected segmentClass(kind: any): string {
    const base = 'flex-1 rounded-sm';
    switch (kind) {
      case 'primary':
        return `${base} bg-[#051125] dark:bg-slate-200`;
      case 'secondary':
        return `${base} bg-[#47607e]`;
      case 'error':
        return `${base} bg-[#ba1a1a]`;
      default:
        return `${base} bg-[#e1e3e4] dark:bg-[var(--erp-login-input-border)]`;
    }
  }

  protected workerCardClass(variant: 'ok' | 'warn' | 'alert'): string {
    const base = 'rounded-lg border-l-4 p-4';
    if (variant === 'alert') {
      return `${base} border-[#ba1a1a] bg-[#ffdad8]/40 dark:bg-[#55000c]/25`;
    }
    return `${base} border-[#47607e] bg-white dark:bg-[var(--erp-login-card)]`;
  }


  protected pctClass(variant: 'ok' | 'warn' | 'alert'): string {
    if (variant === 'alert') {
      return 'text-xs font-bold text-[#ba1a1a]';
    }
    return 'text-xs font-bold text-[#47607e]';
  }

  protected onConfirmDelegation(): void {
    if (!this.canConfirmDelegation()) return;
    this.showDelegationConfirmModal.set(true);
  }

  protected onCommitDelegation(): void {
    const task = this.selectedTask();
    if (!task) return;

    this.isAssigning.set(true);
    const qtyMap = this.delegationQty();
    const assignments = this.selectedWorkerIds()
      .map(workerId => ({ 
        workerId, 
        quantity: Number(qtyMap[workerId]) || 0 
      }))
      .filter(a => a.quantity > 0);

    this.productionService.assignTask(task.id, assignments).subscribe({
      next: () => {
        this.isAssigning.set(false);
        this.showDelegationConfirmModal.set(false);
        window.location.reload();
      },
      error: (err) => {
        this.isAssigning.set(false);
        console.error('Error al asignar tareas', err);
        alert(err.error?.message || 'Ocurrió un error al asignar las tareas.');
      }
    });
  }

  protected onDevolucion(): void {
    return;
  }

  protected onAprobarCierre(): void {
    return;
  }

  protected onOpenCancelModal(taskId: string): void {
    this.taskToCancel.set(taskId);
    this.showCancelModal.set(true);
  }

  protected onConfirmCancel(): void {
    const taskId = this.taskToCancel();
    if (!taskId) return;

    this.productionService.unassignTask(taskId).subscribe({
      next: () => {
        this.showCancelModal.set(false);
        this.taskToCancel.set(null);
        window.location.reload();
      },
      error: (err) => {
        console.error('Error al cancelar asignación', err);
        alert('Error al cancelar la asignación.');
      }
    });
  }

  // ──── PROCESOS ────

  protected setProcessFilter(mode: 'sin_procesos' | 'con_procesos'): void {
    this.processFilterMode.set(mode);
    this.processSelectedTask.set(null);
    this.taskProcesses.set([]);
    this.processFormRows.set([]);
  }

  protected onSelectTaskForProcess(id: string): void {
    const task = this.rawProductionTasks().find(t => t.id === id);
    if (!task) return;
    this.processSelectedTask.set(task);
    this.loadProcesses(id);
    // Cargar el tiempo total estimado existente
    this.totalEstimatedTimeValue.set(task.totalEstimatedTimeValue || 0);
    this.totalEstimatedTimeUnit.set(task.totalEstimatedTimeUnit || 'minutes');
  }

  private loadProcesses(taskId: string) {
    this.productionService.getProcesses(taskId).subscribe({
      next: (processes) => {
        this.taskProcesses.set(processes);
        // Crear form rows a partir de los procesos existentes
        if (processes.length > 0) {
          this.processFormRows.set(processes.map(p => ({
            orderIndex: p.orderIndex,
            name: p.name,
            description: p.description,
            estimatedTimeValue: p.estimatedTimeValue,
            estimatedTimeUnit: p.estimatedTimeUnit || 'minutes',
          })));
        } else {
          this.processFormRows.set([{ orderIndex: 1, name: '', description: '', estimatedTimeValue: 0, estimatedTimeUnit: 'minutes' }]);
        }
      },
      error: () => {
        this.processFormRows.set([{ orderIndex: 1, name: '', description: '', estimatedTimeValue: 0, estimatedTimeUnit: 'minutes' }]);
      },
    });
  }

  protected addProcessRow(): void {
    const rows = this.processFormRows();
    const nextIndex = rows.length > 0 ? Math.max(...rows.map(r => r.orderIndex)) + 1 : 1;
    this.processFormRows.set([...rows, { orderIndex: nextIndex, name: '', description: '', estimatedTimeValue: 0, estimatedTimeUnit: 'minutes' }]);
  }

  protected confirmRemoveProcessRow(index: number) {
    this.processToDeleteIndex.set(index);
    this.showDeleteProcessModal.set(true);
  }

  protected onConfirmDeleteProcess() {
    const index = this.processToDeleteIndex();
    if (index !== null) {
      this.processFormRows.update(prev => {
        const copy = [...prev];
        copy.splice(index, 1);
        // Re-indexar para asegurar orden secuencial persistente
        return copy.map((row, i) => ({ ...row, orderIndex: i + 1 }));
      });
    }
    this.showDeleteProcessModal.set(false);
    this.processToDeleteIndex.set(null);
  }

  /** Al dar click en "Guardar Procesos" se abre el modal para pedir el tiempo total */
  protected onSaveProcesses(): void {
    const task = this.processSelectedTask();
    if (!task) return;
    const rows = this.processFormRows().filter(r => r.name.trim() !== '');
    if (rows.length === 0) return;

    // Abrir modal para pedir el tiempo total estimado
    this.showTotalTimeModal.set(true);
  }

  /** Confirmar guardado con el tiempo total incluido */
  protected onConfirmSaveProcesses(): void {
    const task = this.processSelectedTask();
    if (!task) return;
    const rows = this.processFormRows().filter(r => r.name.trim() !== '');
    if (rows.length === 0) return;

    this.savingProcesses.set(true);
    this.showTotalTimeModal.set(false);

    this.productionService.setProcesses(
      task.id,
      rows,
      this.totalEstimatedTimeValue(),
      this.totalEstimatedTimeUnit(),
    ).subscribe({
      next: () => {
        this.savingProcesses.set(false);
        this.showTotalTimeModal.set(false);
        
        // Premium Success Feedback
        this.successModalConfig.set({
          title: '¡Guardado Correctamente!',
          message: 'Los procesos y el tiempo estimado se han configurado con éxito para esta orden y se ha actualizado la plantilla del producto.'
        });
        this.showSuccessModal.set(true);
      },
      error: (err) => {
        console.error('Error al guardar procesos', err);
        this.savingProcesses.set(false);
        alert('Error al guardar los procesos.');
      },
    });
  }

  protected onCloseSuccessModal() {
    this.showSuccessModal.set(false);
    window.location.reload();
  }

  // ──── MERMAS ────

  private loadWaste(): void {
    this.loadingWaste.set(true);
    this.productionService.getAllWaste().subscribe({
      next: (data) => {
        this.wasteReports.set(data);
        this.loadingWaste.set(false);
      },
      error: () => this.loadingWaste.set(false),
    });
  }

  // ──── REPORTAR A MT ────

  protected onReportToMT(taskId: string): void {
    this.reportingToMT.set(taskId);
    this.productionService.reportToMT(taskId).subscribe({
      next: () => {
        this.reportingToMT.set(null);
        alert('Orden reportada exitosamente a Mundo Terapeuta.');
        window.location.reload();
      },
      error: (err) => {
        this.reportingToMT.set(null);
        console.error('Error al reportar a MT', err);
        alert(err.error?.message || 'Error al reportar a Mundo Terapeuta.');
      }
    });
  }

  // ──── UTILIDADES DE TIEMPO ────

  /**
   * Calcula la duración real de producción para una tarea.
   * Cuenta desde que el PRIMER trabajador inició su primer proceso
   * hasta que el ÚLTIMO terminó su última asignación.
   */
  private calculateRealDuration(task: ProductionTask): string {
    const assignments = task.assignments || [];
    if (assignments.length === 0) return '';

    // Buscar el startedAt más antiguo (primer trabajador que inició)
    const startDates = assignments
      .filter(a => a.startedAt)
      .map(a => new Date(a.startedAt!).getTime());
    
    // Buscar el completedAt más reciente (último trabajador que terminó)
    const endDates = assignments
      .filter(a => a.completedAt)
      .map(a => new Date(a.completedAt!).getTime());

    if (startDates.length === 0 || endDates.length === 0) return '';

    const firstStart = Math.min(...startDates);
    const lastEnd = Math.max(...endDates);
    const totalSeconds = Math.floor((lastEnd - firstStart) / 1000);

    return this.formatDuration(totalSeconds);
  }

  /** Formatea segundos en una cadena legible: "2 semanas 3 días", "4h 15min", etc. */
  protected formatDuration(totalSeconds: number): string {
    if (totalSeconds <= 0) return '0 min';

    const weeks = Math.floor(totalSeconds / 604800);
    const days = Math.floor((totalSeconds % 604800) / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];

    if (weeks > 0) parts.push(`${weeks} sem`);
    if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 && weeks === 0) parts.push(`${minutes} min`);

    // Si solo son segundos
    if (parts.length === 0) parts.push(`${totalSeconds}s`);

    return parts.join(' ');
  }

  /** Formatea el tiempo estimado en formato legible */
  protected formatEstimatedTime(value: number, unit: string): string {
    if (!value || value <= 0) return 'Sin definir';
    const unitLabels: Record<string, string> = {
      minutes: 'min',
      hours: 'h',
      days: 'día(s)',
      weeks: 'sem',
    };
    return `${value} ${unitLabels[unit] || unit}`;
  }
}
