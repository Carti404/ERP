5068  - 14/04/2026, 1:57:21 p.m.     LOG [RouterExplorer] Mapped {/api/v1/messages/attachments/binary-proxy, GET} route +0ms
[Nest] 25068  - 14/04/2026, 1:57:21 p.m.     LOG [RoutesResolver] AttendanceController {/api/v1/attendance}: +0ms
[Nest] 25068  - 14/04/2026, 1:57:21 p.m.     LOG [RouterExplorer] Mapped {/api/v1/attendance/today, GET} route +0ms
[Nest] 25068  - 14/04/2026, 1:57:21 p.m.     LOG [RouterExplorer] Mapped {/api/v1/attendance/me, GET} route +1ms
[1:57:38 p.m.] File change detected. Starting incremental compilation...

src/production/production.service.ts:450:43 - error TS2552: Cannot find name 'assignment'. Did you mean 'assignmentId'?

450     await this.notifyNextWorkerIfAssigned(assignment.taskId, process.orderIndex, assignment.task.productName);     
                                              ~~~~~~~~~~

  src/production/production.service.ts:434:25
    434   async completeProcess(assignmentId: string, processId: string) {
                                ~~~~~~~~~~~~~~~~~~~~
    'assignmentId' is declared here.

src/production/production.service.ts:450:70 - error TS2339: Property 'orderIndex' does not exist on type 'Process'.    

450     await this.notifyNextWorkerIfAssigned(assignment.taskId, process.orderIndex, assignment.task.productName);     
                                                                         ~~~~~~~~~~

src/production/production.service.ts:450:82 - error TS2552: Cannot find name 'assignment'. Did you mean 'assignmentId'?

450     await this.notifyNextWorkerIfAssigned(assignment.taskId, process.orderIndex, assignment.task.productName);     
                                                                                     ~~~~~~~~~~

  src/production/production.service.ts:434:25
    434   async completeProcess(assignmentId: string, processId: string) {
                                ~~~~~~~~~~~~~~~~~~~~
    'assignmentId' is declared here.

[1:57:38 p.m.] Found 3 errors. Watching for file changes.

[Nest] 25068  - 14/04/2026, 1:57:53 p.m.     LOG [ProductionSyncService] Obteniendo catálogo de productos producibles desde Mundo Terapeuta...
[Nest] 25068  - 14/04/2026, 1:58:00 p.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 25068  - 14/04/2026, 1:58:00 p.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.
[Nest] 25068  - 14/04/2026, 1:58:08 p.m.     LOG [ProductionSyncService] Obteniendo catálogo de productos producibles desde Mundo Terapeuta...
[Nest] 25068  - 14/04/2026, 1:58:47 p.m.     LOG [ProductionSyncService] Obteniendo catálogo de productos producibles desde Mundo Terapeuta...
[Nest] 25068  - 14/04/2026, 1:59:00 p.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 25068  - 14/04/2026, 1:59:00 p.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.