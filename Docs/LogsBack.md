Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [RouterExplorer] Mapped {/api/v1/production/clear-assigned-notifications, POST} route +0ms    
[Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [RoutesResolver] NotificationsController {/api/v1/notifications}: +0ms
[Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [RouterExplorer] Mapped {/api/v1/notifications, GET} route +1ms
[Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [RouterExplorer] Mapped {/api/v1/notifications/unread-count, GET} route +0ms
[Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [RouterExplorer] Mapped {/api/v1/notifications/:id/read, PATCH} route +0ms
[Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [RouterExplorer] Mapped {/api/v1/notifications/mark-all-read, POST} route +0ms
[Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [RouterExplorer] Mapped {/api/v1/notifications, DELETE} route +1ms
[Nest] 20864  - 10/04/2026, 4:25:19 p.m.     LOG [NestApplication] Nest application successfully started +12ms
[Nest] 20864  - 10/04/2026, 4:26:00 p.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 20864  - 10/04/2026, 4:26:00 p.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.
[Nest] 20864  - 10/04/2026, 4:26:31 p.m.   ERROR [ExceptionsHandler] QueryFailedError: null value in column "user_id" of relation "attendance_records" violates not-null constraint
    at PostgresQueryRunner.query (H:\dev\ERP\erp-api\node_modules\typeorm\driver\src\driver\postgres\PostgresQueryRunner.ts:325:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async InsertQueryBuilder.execute (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\InsertQueryBuilder.ts:164:33) 
    at async SubjectExecutor.executeInsertOperations (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\SubjectExecutor.ts:435:42)
    at async SubjectExecutor.execute (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\SubjectExecutor.ts:137:9)
    at async EntityPersistExecutor.execute (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\EntityPersistExecutor.ts:182:21)
    at async AttendanceService.registerEvent (H:\dev\ERP\erp-api\src\attendance\attendance.service.ts:76:16)
    at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-execution-context.js:46:28
    at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-proxy.js:9:17 {
  query: 'INSERT INTO "attendance_records"("id", "work_date", "status", "created_at", "updated_at") VALUES (DEFAULT, $1, $2, DEFAULT, DEFAULT) 
RETURNING "id", "status", "created_at", "updated_at"',
  parameters: [
    '2026-04-10',
    'Puntual'
  ],
  driverError: error: null value in column "user_id" of relation "attendance_records" violates not-null constraint
      at H:\dev\ERP\erp-api\node_modules\pg\lib\client.js:631:17
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async PostgresQueryRunner.query (H:\dev\ERP\erp-api\node_modules\typeorm\driver\src\driver\postgres\PostgresQueryRunner.ts:254:25)    
      at async InsertQueryBuilder.execute (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\InsertQueryBuilder.ts:164:33)
      at async SubjectExecutor.executeInsertOperations (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\SubjectExecutor.ts:435:42)
      at async SubjectExecutor.execute (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\SubjectExecutor.ts:137:9)
      at async EntityPersistExecutor.execute (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\EntityPersistExecutor.ts:182:21)
      at async AttendanceService.registerEvent (H:\dev\ERP\erp-api\src\attendance\attendance.service.ts:76:16)
      at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-execution-context.js:46:28
      at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-proxy.js:9:17 {
    length: 343,
    severity: 'ERROR',
    code: '23502',
    detail: 'Failing row contains (85a45bc1-b55c-46c3-be03-c8c6882dc438, null, 2026-04-10, Puntual, 2026-04-10 22:26:31.194759+00, 2026-04-10 22:26:31.194759+00).',
    hint: undefined,
    position: undefined,
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: 'public',
    table: 'attendance_records',
    column: 'user_id',
    dataType: undefined,
    constraint: undefined,
    file: 'execMain.c',
    line: '2057',
    routine: 'ExecConstraints'
  },
  length: 343,
  severity: 'ERROR',
  code: '23502',
  detail: 'Failing row contains (85a45bc1-b55c-46c3-be03-c8c6882dc438, null, 2026-04-10, Puntual, 2026-04-10 22:26:31.194759+00, 2026-04-10 22:26:31.194759+00).',
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: 'public',
  table: 'attendance_records',
  column: 'user_id',
  dataType: undefined,
  constraint: undefined,
  file: 'execMain.c',
  line: '2057',
  routine: 'ExecConstraints'
}
^CPS H:\dev\ERP\erp-api> 