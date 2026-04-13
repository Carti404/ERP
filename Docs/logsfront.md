Lazy chunk files    | Names             |  Raw size
chunk-V6DVO7RR.js   | admin-routes      | 495.17 kB |
chunk-6N6FAS5C.js   | trabajador-routes | 251.47 kB |
chunk-RRW5MB5J.js   | -                 | 102.88 kB |

Application bundle generation complete. [2.707 seconds] - 2026-04-13T17:47:26.039Z

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
Application bundle generation failed. [1.434 seconds] - 2026-04-13T17:58:36.613Z

X [ERROR] TS2339: Property 'availableDays' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:20:81:
      20 │ ...er-balance__value mt-3 text-white">{{ balance.availableDays }}</p>
         ╵                                                  ~~~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:24:15:
      24 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'periodLabel' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:21:70:
      21 │ ... text-xs font-medium text-slate-400">{{ balance.periodLabel }}</p>
         ╵                                                    ~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:24:15:
      24 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'requested' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:28:23:
      28 │             {{ balance.requested.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:24:15:
      24 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'approved' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: 
number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:34:23:
      34 │             {{ balance.approved.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:24:15:
      24 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<WorkerPermisoHistoryItem[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin 
angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:197:22:
      197 │         @for (item of history; track item.id) {
          ╵                       ~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:24:15:
      24 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'LeaveRequestsService'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:28:41:
      28 │   private readonly leaveService = inject(LeaveRequestsService);
         ╵                                          ~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.324 seconds] - 2026-04-13T17:58:41.336Z

X [ERROR] TS2339: Property 'availableDays' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:20:81:
      20 │ ...er-balance__value mt-3 text-white">{{ balance.availableDays }}</p>
         ╵                                                  ~~~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'periodLabel' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:21:70:
      21 │ ... text-xs font-medium text-slate-400">{{ balance.periodLabel }}</p>
         ╵                                                    ~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'requested' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:28:23:
      28 │             {{ balance.requested.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'approved' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: 
number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:34:23:
      34 │             {{ balance.approved.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<WorkerPermisoHistoryItem[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin 
angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:197:22:
      197 │         @for (item of history; track item.id) {
          ╵                       ~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.240 seconds] - 2026-04-13T17:58:49.585Z

X [ERROR] TS2339: Property 'availableDays' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:20:81:
      20 │ ...er-balance__value mt-3 text-white">{{ balance.availableDays }}</p>
         ╵                                                  ~~~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'periodLabel' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:21:70:
      21 │ ... text-xs font-medium text-slate-400">{{ balance.periodLabel }}</p>
         ╵                                                    ~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'requested' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:28:23:
      28 │             {{ balance.requested.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'approved' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: 
number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:34:23:
      34 │             {{ balance.approved.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<WorkerPermisoHistoryItem[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin 
angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:197:22:
      197 │         @for (item of history; track item.id) {
          ╵                       ~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.214 seconds] - 2026-04-13T17:58:59.690Z

X [ERROR] TS2339: Property 'availableDays' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:20:81:
      20 │ ...er-balance__value mt-3 text-white">{{ balance.availableDays }}</p>
         ╵                                                  ~~~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'periodLabel' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:21:70:
      21 │ ... text-xs font-medium text-slate-400">{{ balance.periodLabel }}</p>
         ╵                                                    ~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'requested' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:28:23:
      28 │             {{ balance.requested.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'approved' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: 
number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:34:23:
      34 │             {{ balance.approved.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<WorkerPermisoHistoryItem[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin 
angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:197:22:
      197 │         @for (item of history; track item.id) {
          ╵                       ~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.244 seconds] - 2026-04-13T17:59:28.572Z

X [ERROR] TS2488: Type 'WritableSignal<AdminPermisoKpi[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-permisos.component.html:14:19:
      14 │         @for (k of kpis; track k.id) {
         ╵                    ~~~~

  Error occurs in the template of component AdminPermisosComponent.

    src/app/pages/admin/admin-permisos.component.ts:17:15:
      17 │   templateUrl: './admin-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<AdminPermisoGanttRow[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-permisos.component.html:43:21:
      43 │         @for (row of ganttRows; track row.id) {
         ╵                      ~~~~~~~~~

  Error occurs in the template of component AdminPermisosComponent.

    src/app/pages/admin/admin-permisos.component.ts:17:15:
      17 │   templateUrl: './admin-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'availableDays' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:20:81:
      20 │ ...er-balance__value mt-3 text-white">{{ balance.availableDays }}</p>
         ╵                                                  ~~~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'periodLabel' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:21:70:
      21 │ ... text-xs font-medium text-slate-400">{{ balance.periodLabel }}</p>
         ╵                                                    ~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'requested' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:28:23:
      28 │             {{ balance.requested.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'approved' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: 
number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:34:23:
      34 │             {{ balance.approved.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<WorkerPermisoHistoryItem[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin 
angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:197:22:
      197 │         @for (item of history; track item.id) {
          ╵                       ~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.245 seconds] - 2026-04-13T17:59:42.441Z

X [ERROR] TS2488: Type 'WritableSignal<AdminPermisoKpi[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-permisos.component.html:14:19:
      14 │         @for (k of kpis; track k.id) {
         ╵                    ~~~~

  Error occurs in the template of component AdminPermisosComponent.

    src/app/pages/admin/admin-permisos.component.ts:17:15:
      17 │   templateUrl: './admin-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<AdminPermisoGanttRow[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-permisos.component.html:43:21:
      43 │         @for (row of ganttRows; track row.id) {
         ╵                      ~~~~~~~~~

  Error occurs in the template of component AdminPermisosComponent.

    src/app/pages/admin/admin-permisos.component.ts:17:15:
      17 │   templateUrl: './admin-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'availableDays' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:20:81:
      20 │ ...er-balance__value mt-3 text-white">{{ balance.availableDays }}</p>
         ╵                                                  ~~~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'periodLabel' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:21:70:
      21 │ ... text-xs font-medium text-slate-400">{{ balance.periodLabel }}</p>
         ╵                                                    ~~~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'requested' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:28:23:
      28 │             {{ balance.requested.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'approved' does not exist on type 'WritableSignal<{ availableDays: string | number; periodLabel: string; requested: 
number; approved: number; }>'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:34:23:
      34 │             {{ balance.approved.toString().padStart(2, '0') }}
         ╵                        ~~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2488: Type 'WritableSignal<WorkerPermisoHistoryItem[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin 
angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.html:197:22:
      197 │         @for (item of history; track item.id) {
          ╵                       ~~~~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:25:15:
      25 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


