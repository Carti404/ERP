import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { KpiMiniChartConfig } from './kpi/kpi-chart.model';

@Component({
  selector: 'app-kpi-mini-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (chart().kind) {
      @case ('bars') {
        <svg class="erp-kpi-chart-svg" viewBox="0 0 72 44" preserveAspectRatio="none" aria-hidden="true">
          @for (b of bars(); track $index) {
            <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="2" [attr.fill]="accent()" />
          }
        </svg>
      }
      @case ('donut') {
        <div class="erp-kpi-donut-wrap" aria-hidden="true">
          <div class="erp-kpi-donut-ring" [style.background]="donutGradient()"></div>
          <div class="erp-kpi-donut-hole"></div>
        </div>
      }
      @case ('area') {
        <svg class="erp-kpi-chart-svg" viewBox="0 0 72 40" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient [attr.id]="gradId()" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" [attr.stop-color]="accent()" stop-opacity="0.35" />
              <stop offset="100%" [attr.stop-color]="accent()" stop-opacity="0.06" />
            </linearGradient>
          </defs>
          <polygon [attr.points]="areaPolygon()" [attr.fill]="'url(#' + gradId() + ')'" />
          <polyline
            fill="none"
            [attr.stroke]="accent()"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            [attr.points]="linePoints()"
          />
        </svg>
      }
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 4.25rem;
      min-height: 2.5rem;
    }

    .erp-kpi-chart-svg {
      display: block;
      width: 100%;
      height: 2.5rem;
    }

    .erp-kpi-donut-wrap {
      position: relative;
      width: 3.25rem;
      height: 3.25rem;
      margin-inline: auto;
    }

    .erp-kpi-donut-ring {
      position: absolute;
      inset: 0;
      border-radius: 9999px;
    }

    .erp-kpi-donut-hole {
      position: absolute;
      inset: 22%;
      border-radius: 9999px;
      background: var(--erp-login-card);
      box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.06);
    }

    :host-context(.dark) .erp-kpi-donut-hole {
      background: var(--erp-login-surface);
    }
  `,
})
export class KpiMiniChartComponent {
  readonly chartId = input.required<string>();
  readonly chart = input.required<KpiMiniChartConfig>();
  readonly accent = input.required<string>();

  readonly gradId = computed(() => `kpi-area-${this.chartId()}`);

  readonly bars = computed(() => {
    const c = this.chart();
    if (c.kind !== 'bars' || !c.values?.length) {
      return [];
    }
    const vals = c.values;
    const max = Math.max(...vals, 1);
    const n = vals.length;
    const gap = 2;
    const totalW = 72;
    const h = 40;
    const baseY = 42;
    const barW = (totalW - gap * (n - 1)) / n;
    return vals.map((v, i) => {
      const bh = (v / max) * (h - 6);
      return {
        x: i * (barW + gap),
        y: baseY - bh,
        w: barW,
        h: Math.max(bh, 2),
      };
    });
  });

  readonly donutGradient = computed(() => {
    const c = this.chart();
    if (c.kind !== 'donut' || !c.donut?.length) {
      return 'transparent';
    }
    let acc = 0;
    const stops = c.donut.map((seg) => {
      const start = acc;
      acc += seg.pct;
      return `${seg.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(from -90deg, ${stops.join(', ')})`;
  });

  readonly linePoints = computed(() => this.areaLinePoints());
  readonly areaPolygon = computed(() => {
    const pts = this.areaLinePoints();
    return pts ? `0,40 ${pts} 72,40` : '';
  });

  private areaLinePoints(): string {
    const c = this.chart();
    if (c.kind !== 'area' || !c.values?.length) {
      return '';
    }
    const vals = c.values;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const range = max - min || 1;
    const n = vals.length;
    const w = 72;
    const h = 36;
    const padY = 4;
    const usableH = h - padY * 2;
    return vals
      .map((v, i) => {
        const x = n === 1 ? w / 2 : (i / (n - 1)) * w;
        const norm = (v - min) / range;
        const y = padY + usableH * (1 - norm);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }
}
