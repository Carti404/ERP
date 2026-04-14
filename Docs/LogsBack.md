[Nest] 25100  - 14/04/2026, 1:25:01 p.m.     LOG [RouterExplorer] Mapped {/api/v1/production, GET} route +0ms
[1:29:05 p.m.] File change detected. Starting incremental compilation...

[1:29:57 p.m.] File change detected. Starting incremental compilation...

src/messages/attachments.controller.ts:34:50 - error TS2339: Property 'upload' does not exist on type 'AttachmentsService'.

34     const result = await this.attachmentsService.upload(file);
                                                    ~~~~~~

src/messages/attachments.controller.ts:60:26 - error TS18048: 'result.filename' is possibly 'undefined'.

60     const safeFilename = result.filename.replace(/"/g, '%22');
                            ~~~~~~~~~~~~~~~

src/messages/attachments.controller.ts:91:26 - error TS18048: 'result.filename' is possibly 'undefined'.

91     const safeFilename = result.filename.replace(/"/g, '%22');
                            ~~~~~~~~~~~~~~~

[1:29:57 p.m.] Found 3 errors. Watching for file changes.


