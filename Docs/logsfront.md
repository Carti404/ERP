PS H:\dev\ERP\erp-web> npm start

> erp-web@0.0.0 start
> ng serve

Application bundle generation failed. [2.991 seconds] - 2026-04-16T15:45:36.705Z

X [ERROR] TS2339: Property 'onSendReply' does not exist on type 'ErpInboxComponent'. [plugin angular-compiler]

    src/app/shared/erp-inbox/erp-inbox.component.html:219:110:
      219 │ ...AttachmentLoading()" (click)="onSendReply()" aria-label="Enviar">
          ╵                                  ~~~~~~~~~~~

  Error occurs in the template of component ErpInboxComponent.

    src/app/shared/erp-inbox/erp-inbox.component.ts:168:15:
      168 │   templateUrl: './erp-inbox.component.html',
          ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'onSendReply' does not exist on type 'ErpInboxComponent'. [plugin angular-compiler]

    src/app/shared/erp-inbox/erp-inbox.component.ts:720:11:
      720 │       this.onSendReply();
          ╵            ~~~~~~~~~~~


Watch mode enabled. Watching for file changes...
