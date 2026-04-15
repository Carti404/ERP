chunk-HFJHQSYG.js   | -                 | 141.16 kB |

Application bundle generation complete. [0.497 seconds] - 2026-04-15T23:46:24.575Z

▲ [WARNING] NG8103: NG8103: The `*ngIf` directive was used in the template, but neither the `NgIf` directive nor the `CommonModule` was imported. Use Angular's built-in control flow @if or make sure that either the `NgIf` directive or the `CommonModule` is included in the `@Component.imports` array of this component. Find more at https://v21.angular.dev/extended-diagnostics/NG8103 [plugin angular-compiler]

    src/app/shared/erp-inbox/erp-inbox.component.html:208:30:
      208 │                         <img *ngIf="a.url" [src]="a.url" class="h...
          ╵                               ~~~~

  Warning occurs in the template of component ErpInboxComponent.

    src/app/shared/erp-inbox/erp-inbox.component.ts:168:15:
      168 │   templateUrl: './erp-inbox.component.html',
          ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


▲ [WARNING] NG8103: NG8103: The `*ngIf` directive was used in the template, but neither the `NgIf` directive nor the `CommonModule` was imported. Use Angular's built-in control flow @if or make sure that either the `NgIf` directive or the `CommonModule` is included in the `@Component.imports` array of this component. Find more at https://v21.angular.dev/extended-diagnostics/NG8103 [plugin angular-compiler]

    src/app/shared/erp-inbox/erp-inbox.component.html:209:31:
      209 │                         <span *ngIf="!a.url" class="material-symb...
          ╵                                ~~~~

  Warning occurs in the template of component ErpInboxComponent.

    src/app/shared/erp-inbox/erp-inbox.component.ts:168:15:
      168 │   templateUrl: './erp-inbox.component.html',
          ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Page reload sent to client(s).
