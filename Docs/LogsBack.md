[Nest] 19520  - 13/04/2026, 11:47:45 a.m.     LOG [RouterExplorer] Mapped {/api/v1/production/assignments/:id/waste, POST} route +1ms
[Nest] 19520  - 13/04/2026, 11:47:45 a.m.     LOG [RouterExplorer] Mapped {/api/v1/production/assignments/:id/complete, POST} route +0ms       
[Nest] 19520  - 13/04/2026, 11:47:45 a.m.     LOG [RouterExplorer] Mapped {/api/v1/production/:id/report-to-mt, POST} route +0ms
[11:52:04 a.m.] File change detected. Starting incremental compilation...

src/messages/leave-requests.service.ts:77:38 - error TS2769: No overload matches this call.
  Overload 1 of 3, '(entityLikeArray: DeepPartial<LeaveRequestHistory>[]): LeaveRequestHistory[]', gave the following error.
    Object literal may only specify known properties, and 'leaveRequest' does not exist in type 'DeepPartial<LeaveRequestHistory>[]'.
  Overload 2 of 3, '(entityLike: DeepPartial<LeaveRequestHistory>): LeaveRequestHistory', gave the following error.
    Type '"CREATED"' is not assignable to type 'LeaveRequestActionType | undefined'.

77     const history = this.historyRepo.create({
                                        ~~~~~~

  src/messages/entities/leave-request-history.entity.ts:33:3
[11:58:03 a.m.] File change detected. Starting incremental compilation...

src/messages/leave-requests.service.ts:77:38 - error TS2769: No overload matches this call.
  Overload 1 of 3, '(entityLikeArray: DeepPartial<LeaveRequestHistory>[]): LeaveRequestHistory[]', gave the following error.
  Overload 2 of 3, '(entityLike: DeepPartial<LeaveRequestHistory>): LeaveRequestHistory', gave the following error.
    Type '"CREATED"' is not assignable to type 'LeaveRequestActionType | undefined'.

77     const history = this.historyRepo.create({
[12:00:21 p.m.] Starting compilation in watch mode...

src/messages/leave-requests.service.ts:77:38 - error TS2769: No overload matches this call.
  Overload 1 of 3, '(entityLikeArray: DeepPartial<LeaveRequestHistory>[]): LeaveRequestHistory[]', gave the following error.
    Object literal may only specify known properties, and 'leaveRequest' does not exist in type 'DeepPartial<LeaveRequestHistory>[]'.
  Overload 2 of 3, '(entityLike: DeepPartial<LeaveRequestHistory>): LeaveRequestHistory', gave the following error.
    Type '"CREATED"' is not assignable to type 'LeaveRequestActionType | undefined'.

77     const history = this.historyRepo.create({
                                        ~~~~~~

  src/messages/entities/leave-request-history.entity.ts:33:3
    33   actionType: LeaveRequestActionType;
         ~~~~~~~~~~
    The expected type comes from property 'actionType' which is declared here on type 'DeepPartial<LeaveRequestHistory>'

src/messages/leave-requests.service.ts:105:38 - error TS2769: No overload matches this call.
  Overload 1 of 3, '(entityLikeArray: DeepPartial<LeaveRequestHistory>[]): LeaveRequestHistory[]', gave the following error.
    Object literal may only specify known properties, and 'leaveRequest' does not exist in type 'DeepPartial<LeaveRequestHistory>[]'.
  Overload 2 of 3, '(entityLike: DeepPartial<LeaveRequestHistory>): LeaveRequestHistory', gave the following error.
    Type 'LeaveRequestStatus' is not assignable to type 'LeaveRequestActionType | undefined'.

105     const history = this.historyRepo.create({
                                         ~~~~~~

  src/messages/entities/leave-request-history.entity.ts:33:3
    33   actionType: LeaveRequestActionType;
         ~~~~~~~~~~
    The expected type comes from property 'actionType' which is declared here on type 'DeepPartial<LeaveRequestHistory>'

[12:00:24 p.m.] Found 2 errors. Watching for file changes.

