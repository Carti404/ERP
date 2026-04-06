[Nest] 12708  - 06/04/2026, 11:46:21 a.m.     LOG [RouterExplorer] Mapped {/api/v1/health, GET} route +0ms
[Nest] 12708  - 06/04/2026, 11:46:21 a.m.     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 12708  - 06/04/2026, 11:47:01 a.m.   ERROR [ExceptionsHandler] QueryFailedError: null value in column "user_id" of relation "attendance_records" violates not-null constraint
    at PostgresQueryRunner.query (H:\dev\ERP\erp-api\node_modules\typeorm\driver\src\driver\postgres\PostgresQueryRunner.ts:325:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async InsertQueryBuilder.execute (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\InsertQueryBuilder.ts:164:33)
    at async SubjectExecutor.executeInsertOperations (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\SubjectExecutor.ts:435:42)        
    at async SubjectExecutor.execute (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\SubjectExecutor.ts:137:9)
    at async EntityPersistExecutor.execute (H:\dev\ERP\erp-api\node_modules\typeorm\persistence\src\persistence\EntityPersistExecutor.ts:182:21)
    at async AttendanceService.registerEvent (H:\dev\ERP\erp-api\src\attendance\attendance.service.ts:71:16)
    at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-execution-context.js:46:28
    at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-proxy.js:9:17 {
  query: 'INSERT INTO "attendance_records"("id", "user_id", "work_date", "status", "created_at", "updated_at") VALUES (DEFAULT, DEFAULT, $1, $2, DEFAULT, DEFAULT) RETURNING "id", "status", "created_at", "updated_at"',
  parameters: [
    '2026-04-06',
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
      at async AttendanceService.registerEvent (H:\dev\ERP\erp-api\src\attendance\attendance.service.ts:71:16)
      at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-execution-context.js:46:28
      at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-proxy.js:9:17 {
    length: 343,
    severity: 'ERROR',
    code: '23502',
    detail: 'Failing row contains (1b8b50e8-686e-47b7-9675-7c348de1b035, null, 2026-04-06, Puntual, 2026-04-06 17:47:01.499618+00, 2026-04-06 17:47:01.499618+00).',
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
  detail: 'Failing row contains (1b8b50e8-686e-47b7-9675-7c348de1b035, null, 2026-04-06, Puntual, 2026-04-06 17:47:01.499618+00, 2026-04-06 17:47:01.499618+00).',
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
