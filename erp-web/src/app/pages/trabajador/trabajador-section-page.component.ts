import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

export interface TrabajadorSectionRouteData {
  sectionTitle: string;
  sectionDescription: string;
}

@Component({
  selector: 'app-trabajador-section-page',
  standalone: true,
  template: `
    <div class="erp-trabajador-section mx-auto max-w-2xl">
      <h1 class="erp-trabajador-section__title">{{ heading() }}</h1>
      <p class="erp-trabajador-section__desc">{{ description() }}</p>
      <div class="erp-trabajador-section__panel erp-stitch-panel mt-5">
        <p class="text-sm text-[var(--erp-login-muted)]">
          Módulo en preparación. Aquí se mostrarán los datos en vivo cuando el backend esté disponible.
        </p>
      </div>
    </div>
  `,
  styles: `
    .erp-trabajador-section__title {
      font-size: 1.125rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--erp-login-text-primary);
    }

    @media (min-width: 640px) {
      .erp-trabajador-section__title {
        font-size: 1.25rem;
      }
    }

    .erp-trabajador-section__desc {
      margin-top: 0.35rem;
      max-width: 42rem;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--erp-login-muted);
    }
  `,
})
export class TrabajadorSectionPageComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly data = toSignal(this.route.data, {
    initialValue: { sectionTitle: '', sectionDescription: '' } satisfies Partial<TrabajadorSectionRouteData>,
  });

  protected readonly heading = computed(() => this.data()['sectionTitle'] ?? 'Sección');

  protected readonly description = computed(() => this.data()['sectionDescription'] ?? '');
}
