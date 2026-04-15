chunk-ZG7NXQWY.js   | -                 | 132.02 kB |

Application bundle generation complete. [5.683 seconds] - 2026-04-15T16:45:06.373Z

Watch mode enabled. Watching for file changes...
NOTE: Raw file sizes do not reflect development server per-request transformations.
  ➜  Local:   http://localhost:4200/
  ➜  press h + enter to show help
Application bundle generation failed. [1.560 seconds] - 2026-04-15T16:49:00.752Z

X [ERROR] TS2339: Property 'title' does not exist on type 'WritableSignal<AttendanceCalendarPanelMock>'. [plugin angular-compiler]

    src/app/pages/admin/admin-dashboard.component.html:44:32:
      44 │           {{ attendanceCalendar.title }}
         ╵                                 ~~~~~

  Error occurs in the template of component AdminDashboardComponent.

    src/app/pages/admin/admin-dashboard.component.ts:20:15:
      20 │   templateUrl: './admin-dashboard.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'weekDays' does not exist on type 'WritableSignal<AttendanceCalendarPanelMock>'. [plugin angular-compiler]

    src/app/pages/admin/admin-dashboard.component.html:53:38:
      53 │         @for (w of attendanceCalendar.weekDays; track $index) {
         ╵                                       ~~~~~~~~

  Error occurs in the template of component AdminDashboardComponent.

    src/app/pages/admin/admin-dashboard.component.ts:20:15:
      20 │   templateUrl: './admin-dashboard.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'days' does not exist on type 'WritableSignal<AttendanceCalendarPanelMock>'. [plugin angular-compiler]

    src/app/pages/admin/admin-dashboard.component.html:56:41:
      56 │         @for (cell of attendanceCalendar.days; track $index) {
         ╵                                          ~~~~

  Error occurs in the template of component AdminDashboardComponent.

    src/app/pages/admin/admin-dashboard.component.ts:20:15:
      20 │   templateUrl: './admin-dashboard.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'critical' does not exist on type 'WritableSignal<AttendanceCalendarPanelMock>'. [plugin angular-compiler]

    src/app/pages/admin/admin-dashboard.component.html:64:34:
      64 │             {{ attendanceCalendar.critical.title }}
         ╵                                   ~~~~~~~~

  Error occurs in the template of component AdminDashboardComponent.

    src/app/pages/admin/admin-dashboard.component.ts:20:15:
      20 │   templateUrl: './admin-dashboard.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'critical' does not exist on type 'WritableSignal<AttendanceCalendarPanelMock>'. [plugin angular-compiler]

    src/app/pages/admin/admin-dashboard.component.html:68:32:
      68 │           {{ attendanceCalendar.critical.body }}
         ╵                                 ~~~~~~~~

  Error occurs in the template of component AdminDashboardComponent.

    src/app/pages/admin/admin-dashboard.component.ts:20:15:
      20 │   templateUrl: './admin-dashboard.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'AttendanceCalendarPanelMock'. [plugin angular-compiler]

    src/app/pages/admin/admin-dashboard.component.ts:27:40:
      27 │ ...Calendar = signal<AttendanceCalendarPanelMock>(ADMIN_ATTENDANCE...
         ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.211 seconds] - 2026-04-15T16:49:07.959Z

X [ERROR] TS2304: Cannot find name 'AttendanceCalendarPanelMock'. [plugin angular-compiler]

    src/app/pages/admin/admin-dashboard.component.ts:27:40:
      27 │ ...Calendar = signal<AttendanceCalendarPanelMock>(ADMIN_ATTENDANCE...
         ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~


