[Nest] 7440  - 09/04/2026, 12:52:07 p.m.     LOG [RouterExplorer] Mapped {/api/v1/production/assignments/:id/complete, POST} route +1ms        
[Nest] 7440  - 09/04/2026, 12:52:07 p.m.     LOG [NestApplication] Nest application successfully started +14ms
[Nest] 7440  - 09/04/2026, 12:52:33 p.m.     LOG [ProductionSyncService] Obteniendo catálogo de productos producibles desde Mundo Terapeuta...
[Nest] 7440  - 09/04/2026, 12:52:33 p.m.   ERROR [ExceptionsHandler] QueryFailedError: relation "production_processes" does not exist
    at PostgresQueryRunner.query (H:\dev\ERP\erp-api\node_modules\typeorm\driver\src\driver\postgres\PostgresQueryRunner.ts:325:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async SelectQueryBuilder.loadRawResults (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:3868:25)
    at async SelectQueryBuilder.executeEntitiesAndRawResults (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:3614:26)
    at async SelectQueryBuilder.getRawAndEntities (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:1671:29)
    at async SelectQueryBuilder.getMany (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:1761:25)    at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-execution-context.js:46:28
    at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-proxy.js:9:17 {
  query: 'SELECT "ProductionTask"."id" AS "ProductionTask_id", "ProductionTask"."external_mt_id" AS "ProductionTask_external_mt_id", "ProductionTask"."order_number" AS "ProductionTask_order_number", "ProductionTask"."product_id" AS "ProductionTask_product_id", "ProductionTask"."product_name" AS "ProductionTask_product_name", "ProductionTask"."quantity_to_produce" AS "ProductionTask_quantity_to_produce", "ProductionTask"."recipe" AS "ProductionTask_recipe", "ProductionTask"."assigned_worker_id" AS "ProductionTask_assigned_worker_id", "ProductionTask"."status" AS "ProductionTask_status", "ProductionTask"."created_at" AS "ProductionTask_created_at", "ProductionTask"."updated_at" AS "ProductionTask_updated_at", "ProductionTask__ProductionTask_processes"."id" AS "ProductionTask__ProductionTask_processes_id", "ProductionTask__ProductionTask_processes"."task_id" AS "ProductionTask__ProductionTask_processes_task_id", "ProductionTask__ProductionTask_processes"."order_index" AS "ProductionTask__ProductionTask_processes_order_index", "ProductionTask__ProductionTask_processes"."name" AS "ProductionTask__ProductionTask_processes_name", "ProductionTask__ProductionTask_processes"."description" AS "ProductionTask__ProductionTask_processes_description", "ProductionTask__ProductionTask_processes"."estimated_time_minutes" AS "ProductionTask__ProductionTask_processes_estimated_time_minutes", "ProductionTask__ProductionTask_processes"."created_at" AS "ProductionTask__ProductionTask_processes_created_at", "ProductionTask__ProductionTask_processes"."updated_at" AS "ProductionTask__ProductionTask_processes_updated_at" FROM "production_tasks" "ProductionTask" LEFT JOIN "production_processes" "ProductionTask__ProductionTask_processes" ON "ProductionTask__ProductionTask_processes"."task_id"="ProductionTask"."id" ORDER BY "ProductionTask"."created_at" DESC',
  parameters: [],
  driverError: error: relation "production_processes" does not exist
      at H:\dev\ERP\erp-api\node_modules\pg\lib\client.js:631:17
      at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
      at async PostgresQueryRunner.query (H:\dev\ERP\erp-api\node_modules\typeorm\driver\src\driver\postgres\PostgresQueryRunner.ts:254:25)    
      at async SelectQueryBuilder.loadRawResults (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:3868:25)
      at async SelectQueryBuilder.executeEntitiesAndRawResults (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:3614:26)
      at async SelectQueryBuilder.getRawAndEntities (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:1671:29)
      at async SelectQueryBuilder.getMany (H:\dev\ERP\erp-api\node_modules\typeorm\query-builder\src\query-builder\SelectQueryBuilder.ts:1761:25)
      at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-execution-context.js:46:28
      at async H:\dev\ERP\erp-api\node_modules\@nestjs\core\router\router-proxy.js:9:17 {
    length: 121,
    severity: 'ERROR',
    code: '42P01',
    detail: undefined,
    hint: undefined,
    position: '1664',
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'parse_relation.c',
    line: '1449',
    routine: 'parserOpenTable'
  },
  length: 121,
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '1664',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1449',
  routine: 'parserOpenTable'
}
