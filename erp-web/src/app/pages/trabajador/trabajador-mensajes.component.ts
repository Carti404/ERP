import { Component } from '@angular/core';

import { ErpInboxComponent } from '../../shared/erp-inbox/erp-inbox.component';

@Component({
  selector: 'app-trabajador-mensajes',
  standalone: true,
  imports: [ErpInboxComponent],
  host: {
    class: 'absolute inset-0 block overflow-hidden',
  },
  template: `<app-erp-inbox
    pageTitle="Buzón de mensajes"
    pageSubtitle="Mensajes internos con compañeros, supervisión y administración. Elige destinatario, asunto y texto del mensaje."
    sidebarHeading="Tu buzón"
    sidebarSub="Mensajes internos"
  />`,
})
export class TrabajadorMensajesComponent {}
