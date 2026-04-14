[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/leave-requests/admin/stats, GET} route +0ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/leave-requests/balance, GET} route +0ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/leave-requests/me, GET} route +0ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/leave-requests, GET} route +1ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/leave-requests, POST} route +0ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/leave-requests/:id/status, PATCH} route +0ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RoutesResolver] AttendanceController {/api/v1/attendance}: +0ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/attendance/today, GET} route +1ms
[Nest] 9368  - 14/04/2026, 9:58:18 a.m.     LOG [RouterExplorer] Mapped {/api/v1/attendance/me, GET} route +0ms
[9:58:58 a.m.] File change detected. Starting incremental compilation...

src/app.module.ts:31:2 - error TS2552: Cannot find name 'Module'. Did you mean 'module'?

31 @Module({
    ~~~~~~

  node_modules/@types/node/module.d.ts:886:13
    886         var module: NodeJS.Module;
                    ~~~~~~
    'module' is declared here.

src/app.module.ts:33:5 - error TS2304: Cannot find name 'ConfigModule'.  

[9:59:10 a.m.] File change detected. Starting incremental compilation...

src/app.module.ts:31:2 - error TS2552: Cannot find name 'Module'. Did you mean 'module'?

31 @Module({
    ~~~~~~

  node_modules/@types/node/module.d.ts:886:13
    886         var module: NodeJS.Module;
                    ~~~~~~
    'module' is declared here.

src/app.module.ts:33:5 - error TS2304: Cannot find name 'ConfigModule'.  

33     ConfigModule.forRoot({ isGlobal: true }),
       ~~~~~~~~~~~~

[9:59:16 a.m.] File change detected. Starting incremental compilation...

src/app.module.ts:31:2 - error TS2552: Cannot find name 'Module'. Did you mean 'module'?

31 @Module({
    ~~~~~~

  node_modules/@types/node/module.d.ts:886:13
    886         var module: NodeJS.Module;
                    ~~~~~~
    'module' is declared here.

src/app.module.ts:33:5 - error TS2304: Cannot find name 'ConfigModule'.  

33     ConfigModule.forRoot({ isGlobal: true }),
       ~~~~~~~~~~~~

src/app.module.ts:39:17 - error TS2304: Cannot find name 'ConfigModule'. 

39       imports: [ConfigModule],
                   ~~~~~~~~~~~~

[9:59:22 a.m.] File change detected. Starting incremental compilation...

src/app.module.ts:31:2 - error TS2552: Cannot find name 'Module'. Did you mean 'module'?

31 @Module({
    ~~~~~~

  node_modules/@types/node/module.d.ts:886:13
    886         var module: NodeJS.Module;
                    ~~~~~~
    'module' is declared here.

src/app.module.ts:33:5 - error TS2304: Cannot find name 'ConfigModule'.  

33     ConfigModule.forRoot({ isGlobal: true }),
       ~~~~~~~~~~~~

src/app.module.ts:39:17 - error TS2304: Cannot find name 'ConfigModule'. 

39       imports: [ConfigModule],
                   ~~~~~~~~~~~~

[9:59:33 a.m.] File change detected. Starting incremental compilation...

src/app.module.ts:31:2 - error TS2552: Cannot find name 'Module'. Did you mean 'module'?

31 @Module({
    ~~~~~~

  node_modules/@types/node/module.d.ts:886:13
    886         var module: NodeJS.Module;
                    ~~~~~~
    'module' is declared here.

src/app.module.ts:33:5 - error TS2304: Cannot find name 'ConfigModule'.  

33     ConfigModule.forRoot({ isGlobal: true }),
       ~~~~~~~~~~~~

src/app.module.ts:39:17 - error TS2304: Cannot find name 'ConfigModule'. 

39       imports: [ConfigModule],
                   ~~~~~~~~~~~~

[9:59:46 a.m.] File change detected. Starting incremental compilation...

src/app.module.ts:31:2 - error TS2552: Cannot find name 'Module'. Did you mean 'module'?

31 @Module({
    ~~~~~~

  node_modules/@types/node/module.d.ts:886:13
    886         var module: NodeJS.Module;
                    ~~~~~~
    'module' is declared here.

src/app.module.ts:33:5 - error TS2304: Cannot find name 'ConfigModule'.  

33     ConfigModule.forRoot({ isGlobal: true }),
       ~~~~~~~~~~~~

src/app.module.ts:39:17 - error TS2304: Cannot find name 'ConfigModule'. 

39       imports: [ConfigModule],
                   ~~~~~~~~~~~~

[9:59:55 a.m.] File change detected. Starting incremental compilation...

src/app.module.ts:31:2 - error TS2552: Cannot find name 'Module'. Did you mean 'module'?

31 @Module({
    ~~~~~~

  node_modules/@types/node/module.d.ts:886:13
    886         var module: NodeJS.Module;
                    ~~~~~~
    'module' is declared here.

src/app.module.ts:33:5 - error TS2304: Cannot find name 'ConfigModule'.  

33     ConfigModule.forRoot({ isGlobal: true }),
       ~~~~~~~~~~~~

src/app.module.ts:39:17 - error TS2304: Cannot find name 'ConfigModule'. 

39       imports: [ConfigModule],
                   ~~~~~~~~~~~~

src/app.module.ts:40:28 - error TS2304: Cannot find name 'ConfigService'.

40       useFactory: (config: ConfigService) => ({
                              ~~~~~~~~~~~~~

src/app.module.ts:69:16 - error TS2304: Cannot find name 'ConfigService'.

69       inject: [ConfigService],
                  ~~~~~~~~~~~~~

src/app.module.ts:79:5 - error TS2304: Cannot find name 'ScheduleModule'.

79     ScheduleModule.forRoot(),
       ~~~~~~~~~~~~~~

src/messages/attachments.controller.ts:19:50 - error TS2694: Namespace 'global.Express' has no exported member 'Multer'.

19   async uploadFile(@UploadedFile() file: Express.Multer.File) {
                                                    ~~~~~~

src/messages/attachments.service.ts:21:30 - error TS2694: Namespace 'global.Express' has no exported member 'Multer'.

21   async create(file: Express.Multer.File): Promise<InternalMessageAttachment> {
                                ~~~~~~

src/messages/entities/internal-message.entity.ts:67:4 - error TS2304: Cannot find name 'OneToMany'.

67   @OneToMany(() => InternalMessageAttachment, (attachment) => attachment.message)
      ~~~~~~~~~

[9:59:55 a.m.] Found 9 errors. Watching for file changes.

[Nest] 9368  - 14/04/2026, 10:00:00 a.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 9368  - 14/04/2026, 10:00:00 a.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.
[Nest] 9368  - 14/04/2026, 10:01:00 a.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 9368  - 14/04/2026, 10:01:00 a.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.
[Nest] 9368  - 14/04/2026, 10:02:00 a.m.     LOG [ProductionSyncService] Sincronizando órdenes de producción desde Mundo Terapeuta...
[Nest] 9368  - 14/04/2026, 10:02:00 a.m.     LOG [ProductionSyncService] Sincronización completada. 0 nuevas órdenes importadas.
