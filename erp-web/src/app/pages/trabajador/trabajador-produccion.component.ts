import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ProductionService,
  ProductionAssignment,
  ProductionProcess,
  ProcessTracking,
} from '../../core/services/production.service';

interface WasteFormItem {
  productId: string;
  productName: string;
  itemType: string;
  quantity: number;
  unitOfMeasure: string;
  notes: string;
}

@Component({
  selector: 'app-trabajador-produccion',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule],
  templateUrl: './trabajador-produccion.component.html',
})
export class TrabajadorProduccionComponent implements OnInit, OnDestroy {
  private productionService = inject(ProductionService);
  
  protected readonly assignments = signal<ProductionAssignment[]>([]);
  protected readonly loading = signal(false);

  // Vista activa del trabajador
  protected readonly activeView = signal<'list' | 'processes' | 'waste' | 'completed'>('list');
  protected readonly activeAssignment = signal<ProductionAssignment | null>(null);

  // Procesos de la orden activa
  protected readonly processes = signal<ProductionProcess[]>([]);
  protected readonly tracking = signal<ProcessTracking[]>([]);

  // Timer para el proceso activo
  protected readonly activeTimerSeconds = signal(0);
  private timerInterval: any = null;
  private suppressAutoJump = false;

  // Mermas
  protected readonly wasteItems = signal<WasteFormItem[]>([]);
  protected readonly wasteSuggestions = signal<any[]>([]);
  protected readonly wasteSearchText = signal('');
  protected readonly submittingWaste = signal(false);

  protected readonly pendingAssignments = computed(() => 
    this.assignments().filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS')
  );

  protected readonly historyAssignments = computed(() => 
    this.assignments().filter(a => a.status === 'COMPLETED')
  );

  // Computados para la vista de procesos
  protected readonly sortedProcesses = computed(() => {
    return [...this.processes()].sort((a, b) => a.orderIndex - b.orderIndex);
  });

  protected readonly processStatuses = computed(() => {
    const procs = this.sortedProcesses();
    const trk = this.tracking();

    return procs.map(proc => {
      const t = trk.find(tr => tr.processId === proc.id);
      let status: 'pending' | 'active' | 'completed' = 'pending';
      if (t?.completedAt) {
        status = 'completed';
      } else if (t?.startedAt) {
        status = 'active';
      }
      return {
        process: proc,
        tracking: t || null,
        status,
        durationSeconds: t?.durationSeconds || null,
      };
    });
  });

  protected readonly currentActiveProcess = computed(() => {
    return this.processStatuses().find(ps => ps.status === 'active');
  });

  protected readonly nextPendingProcess = computed(() => {
    return this.processStatuses().find(ps => ps.status === 'pending');
  });

  protected readonly allProcessesCompleted = computed(() => {
    const statuses = this.processStatuses();
    return statuses.length > 0 && statuses.every(ps => ps.status === 'completed');
  });

  // Autocompletado de insumos de la receta
  protected readonly recipeIngredients = computed(() => {
    const assignment = this.activeAssignment();
    if (!assignment?.task?.recipe?.items) return [];
    return assignment.task.recipe.items.map((item: any) => ({
      productId: item.productId || '',
      productName: item.productName || item.product?.name || 'Insumo',
      itemType: item.itemType || item.product?.itemType || '',
      unitOfMeasure: item.unitOfMeasure || item.product?.unitOfMeasure || '',
    }));
  });

  protected readonly filteredSuggestions = computed(() => {
    const search = this.wasteSearchText().toLowerCase().trim();
    if (!search) return [];
    return this.recipeIngredients().filter((ing: any) =>
      ing.productName.toLowerCase().includes(search)
    );
  });

  ngOnInit() {
    this.loadAssignments();
    this.productionService.clearAssignedNotifications().subscribe();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  protected loadAssignments() {
    this.loading.set(true);
    this.productionService.getMyAssignments().subscribe({
      next: (data) => {
        this.assignments.set(data);
        this.loading.set(false);

        // Si hay una asignación activa en progreso con tracking, restaurar la vista
        // PERO solo si el usuario no acaba de presionar "Atrás"
        if (!this.suppressAutoJump) {
          const inProgress = data.find(a => a.status === 'IN_PROGRESS');
          if (inProgress && inProgress.processTracking?.some(t => t.startedAt && !t.completedAt)) {
            this.openProcessView(inProgress);
          }
        }
        this.suppressAutoJump = false;
      },
      error: () => this.loading.set(false)
    });
  }

  // ──── Iniciar producción -> ver procesos ────

  protected openProcessView(assignment: ProductionAssignment) {
    this.activeAssignment.set(assignment);
    this.activeView.set('processes');

    // Cargar procesos de la tarea
    const taskProcesses = assignment.task?.processes || [];
    this.processes.set(taskProcesses);

    // Cargar tracking desde la data que ya trajo el backend
    const existingTracking = assignment.processTracking || [];
    this.tracking.set(existingTracking);

    // Si hay un proceso activo (startedAt pero sin completedAt), restaurar el timer
    const active = existingTracking.find(t => t.startedAt && !t.completedAt);
    if (active) {
      const elapsed = Math.floor((Date.now() - new Date(active.startedAt!).getTime()) / 1000);
      this.activeTimerSeconds.set(elapsed);
      this.startTimer();
    } else if (this.allProcessesCompleted()) {
      // Si ya terminó todo pero no ha finalizado la asignación, ir directo a mermas
      this.showWasteForm();
    }
  }

  protected onStartProcess(processId: string) {
    const assignment = this.activeAssignment();
    if (!assignment) return;

    this.productionService.startProcess(assignment.id, processId).subscribe({
      next: (newTracking) => {
        this.tracking.update(prev => [...prev, newTracking]);
        this.activeTimerSeconds.set(0);
        this.startTimer();

        // Si el assignment era ASSIGNED, actualizar localmente
        if (assignment.status === 'ASSIGNED') {
          const updated = { ...assignment, status: 'IN_PROGRESS' as const };
          this.activeAssignment.set(updated);
          this.assignments.update(list =>
            list.map(a => a.id === updated.id ? updated : a)
          );
        }
      },
      error: (err) => {
        console.error('Error al iniciar proceso', err);
        alert(err.error?.message || 'No se pudo iniciar el proceso.');
      }
    });
  }

  protected onCompleteProcess(processId: string) {
    const assignment = this.activeAssignment();
    if (!assignment) return;

    this.productionService.completeProcess(assignment.id, processId).subscribe({
      next: (completedTracking) => {
        this.tracking.update(prev =>
          prev.map(t => t.processId === processId && !t.completedAt ? completedTracking : t)
        );
        this.stopTimer();
        this.activeTimerSeconds.set(0);

        // Verificar si todos los procesos terminaron
        setTimeout(() => {
          if (this.allProcessesCompleted()) {
            this.showWasteForm();
          }
        }, 500);
      },
      error: (err) => {
        console.error('Error al completar proceso', err);
        alert(err.error?.message || 'No se pudo completar el proceso.');
      }
    });
  }

  // ──── Timer ────

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.activeTimerSeconds.update(v => v + 1);
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  protected formatEstimatedTime(value: number, unit: string): string {
    if (!value) return '0';
    const mapping: Record<string, string> = {
      minutes: 'min',
      hours: 'hrs',
      days: 'días',
      weeks: 'sem',
    };
    return `${value} ${mapping[unit] || unit}`;
  }

  protected formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  // ──── Mermas ────

  private showWasteForm() {
    this.activeView.set('waste');
    this.wasteItems.set([]);
    this.wasteSearchText.set('');
  }

  protected onWasteSearchInput(text: string) {
    this.wasteSearchText.set(text);
  }

  protected selectSuggestion(ingredient: any) {
    const items = this.wasteItems();
    // Verificar si ya se agregó
    const exists = items.find(i => i.productId === ingredient.productId);
    if (exists) return;

    this.wasteItems.update(prev => [...prev, {
      productId: ingredient.productId,
      productName: ingredient.productName,
      itemType: ingredient.itemType,
      quantity: 0,
      unitOfMeasure: ingredient.unitOfMeasure,
      notes: '',
    }]);
    this.wasteSearchText.set('');
  }

  protected removeWasteItem(index: number) {
    this.wasteItems.update(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }

  protected onSubmitWaste() {
    const assignment = this.activeAssignment();
    if (!assignment) return;

    this.submittingWaste.set(true);

    // Primero reportar la merma (si hay items)
    const validItems = this.wasteItems().filter(i => i.quantity > 0);
    const wasteObs = validItems.length > 0
      ? this.productionService.reportWaste(assignment.id, validItems)
      : this.productionService.reportWaste(assignment.id, []);

    wasteObs.subscribe({
      next: () => {
        // Ahora finalizar la asignación
        this.productionService.completeAssignment(assignment.id).subscribe({
          next: () => {
            this.submittingWaste.set(false);
            this.activeView.set('completed');
          },
          error: (err) => {
            this.submittingWaste.set(false);
            console.error('Error al completar asignación', err);
            alert(err.error?.message || 'Error al finalizar la producción.');
          }
        });
      },
      error: (err) => {
        this.submittingWaste.set(false);
        console.error('Error al reportar merma', err);
        alert('Error al reportar la merma.');
      }
    });
  }

  protected onSkipWaste() {
    const assignment = this.activeAssignment();
    if (!assignment) return;

    this.submittingWaste.set(true);
    this.productionService.completeAssignment(assignment.id).subscribe({
      next: () => {
        this.submittingWaste.set(false);
        this.activeView.set('completed');
      },
      error: (err) => {
        this.submittingWaste.set(false);
        console.error('Error al completar asignación', err);
        alert(err.error?.message || 'Error al finalizar la producción.');
      }
    });
  }

  // ──── Volver a la lista ────

  protected backToList() {
    this.suppressAutoJump = true;
    this.activeView.set('list');
    this.activeAssignment.set(null);
    this.processes.set([]);
    this.tracking.set([]);
    this.stopTimer();
    this.activeTimerSeconds.set(0);
    this.loadAssignments();
  }

  // ──── Historial: calcular duración total ────

  protected getTotalDuration(assignment: ProductionAssignment): string {
    if (!assignment.startedAt || !assignment.completedAt) return '—';
    const start = new Date(assignment.startedAt).getTime();
    const end = new Date(assignment.completedAt).getTime();
    const totalSeconds = Math.floor((end - start) / 1000);
    return this.formatTime(totalSeconds);
  }

  protected getRecipe(assignment: ProductionAssignment) {
    if (!assignment.task?.recipe?.items) return [];
    return assignment.task.recipe.items.map((item: any) => ({
      name: item.productName || 'Insumo',
      quantity: (Number(item.quantityPerUnit) || 0) * assignment.quantity,
      unit: item.unitOfMeasure || ''
    }));
  }
}
