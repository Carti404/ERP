import { Component } from '@angular/core';

@Component({
  selector: 'app-panel',
  standalone: true,
  template: `
    <main
      class="flex min-h-dvh items-center justify-center bg-[var(--erp-login-surface)] p-6 text-[var(--erp-login-text-primary)]"
    >
      <p class="text-center text-sm font-semibold">Sesión iniciada. Panel en construcción.</p>
    </main>
  `,
})
export class PanelPage {}
