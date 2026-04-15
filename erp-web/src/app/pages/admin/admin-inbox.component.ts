import { Component } from '@angular/core';

import { ErpInboxComponent } from '../../shared/erp-inbox/erp-inbox.component';

@Component({
  selector: 'app-admin-inbox',
  standalone: true,
  imports: [ErpInboxComponent],
  host: {
    class: 'absolute inset-0 block overflow-hidden',
  },
  template: '<app-erp-inbox />',
})
export class AdminInboxComponent {}
