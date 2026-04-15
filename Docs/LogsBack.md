[Nest] 12700  - 15/04/2026, 3:52:10 p.m.     LOG [RouterExplorer] Mapped {/api/v1/health, GET} route +0ms
[3:53:04 p.m.] File change detected. Starting incremental compilation...

src/messages/leave-requests.service.ts:109:34 - error TS2769: No overload matches this call.
  Overload 1 of 5, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 5, '(vd: VarDate): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'VarDate'.
      Type 'undefined' is not assignable to type 'VarDate'.
  Overload 3 of 5, '(value: string | number): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number'.       
      Type 'undefined' is not assignable to type 'string | number'.

109         req.startDate = new Date(data.proposedStartDate);
                                     ~~~~~~~~~~~~~~~~~~~~~~


src/messages/leave-requests.service.ts:110:32 - error TS2769: No overload matches this call.
  Overload 1 of 5, '(value: string | number | Date): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number | Date'.
      Type 'undefined' is not assignable to type 'string | number | Date'.
  Overload 2 of 5, '(vd: VarDate): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'VarDate'.
      Type 'undefined' is not assignable to type 'VarDate'.
  Overload 3 of 5, '(value: string | number): Date', gave the following error.
    Argument of type 'string | undefined' is not assignable to parameter of type 'string | number'.
      Type 'undefined' is not assignable to type 'string | number'.

110         req.endDate = new Date(data.proposedEndDate || data.proposedStartDate);
                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
[4:11:49 p.m.] File change detected. Starting incremental compilation...

[4:11:56 p.m.] File change detected. Starting incremental compilation...

src/system-parameters/system-parameters.service.ts:87:7 - error TS2353: Object literal may only specify known properties, and 'lunchFrom' does 
not exist in type 'SystemParametersResponse'.

87       lunchFrom: toHm(rest.lunchFromTime),
         ~~~~~~~~~

src/system-parameters/system-parameters.service.ts:89:35 - error TS2339: Property 'vacationDeductionDays' does not exist on type 'PlantRestSettings'.
[4:12:30 p.m.] File change detected. Starting incremental compilation...

src/system-parameters/system-parameters.service.ts:87:7 - error TS2353: Object literal may only specify known properties, and 'lunchFrom' does 
not exist in type 'SystemParametersResponse'.

87       lunchFrom: toHm(rest.lunchFromTime),
         ~~~~~~~~~

[4:12:31 p.m.] Found 1 error. Watching for file changes.

[Nest] 12700  - 15/04/2026, 4:13:00 p.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 12700  - 15/04/2026, 4:13:00 p.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.
[Nest] 12700  - 15/04/2026, 4:14:00 p.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 12700  - 15/04/2026, 4:14:00 p.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.


















