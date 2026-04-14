
X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:437:7:
      437 │     }));
          ╵        ^


X [ERROR] TS18004: No value exists in scope for the shorthand property 'let'. Either declare one or provide an initializer. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:439:4:
      439 │     let finalReason = this.reason();
          ╵     ~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:439:8:
      439 │     let finalReason = this.reason();
          ╵         ~~~~~~~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:439:22:
      439 │     let finalReason = this.reason();
          ╵                       ~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:439:35:
      439 │     let finalReason = this.reason();
          ╵                                    ^


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:440:12:
      440 │     if (this.requestNature() === 'ABSENCE') {
          ╵             ^


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:440:42:
      440 │     if (this.requestNature() === 'ABSENCE') {
          ╵                                           ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:440:44:
      440 │     if (this.requestNature() === 'ABSENCE') {
          ╵                                             ^


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:441:27:
      441 │       const subtypeLabel = this.absenceSubtype() === 'PROGRAMMED'...
          ╵                            ~~~~


X [ERROR] TS2304: Cannot find name 'finalReason'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:442:6:
      442 │       finalReason = `${subtypeLabel} ${finalReason}`;
          ╵       ~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'finalReason'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:442:39:
      442 │       finalReason = `${subtypeLabel} ${finalReason}`;
          ╵                                        ~~~~~~~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:446:12:
      446 │       type: this.requestNature() === 'VACATION' ? 'VACATION' : 'A...
          ╵             ~~~~


X [ERROR] TS2304: Cannot find name 'minDate'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:447:17:
      447 │       startDate: minDate,
          ╵                  ~~~~~~~


X [ERROR] TS2304: Cannot find name 'maxDate'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:448:15:
      448 │       endDate: maxDate,
          ╵                ~~~~~~~


X [ERROR] TS2304: Cannot find name 'totalCount'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:449:17:
      449 │       totalDays: totalCount,
          ╵                  ~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'finalReason'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:450:14:
      450 │       reason: finalReason || (this.requestNature() === 'VACATION'...
          ╵               ~~~~~~~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:450:30:
      450 │       reason: finalReason || (this.requestNature() === 'VACATION'...
          ╵                               ~~~~


X [ERROR] TS2304: Cannot find name 'evidenceUrl'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:451:19:
      451 │       evidenceUrl: evidenceUrl || '',
          ╵                    ~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'backendSegments'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:452:16:
      452 │       segments: backendSegments
          ╵                 ~~~~~~~~~~~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:455:4:
      455 │     this.leaveService.createRequest(payload).subscribe({
          ╵     ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:457:8:
      457 │         this.isSending.set(false);
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:458:8:
      458 │         this.showConfirmModal.set(false);
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:459:8:
      459 │         this.fb.showToast('Solicitud enviada correctamente', 'suc...
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:460:8:
      460 │         this.clearSelection();
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:461:8:
      461 │         this.reason.set('');
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:462:8:
      462 │         this.evidenceFile.set(null);
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:463:8:
      463 │         this.loadData();
          ╵         ~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:465:14:
      465 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:466:8:
      466 │         this.isSending.set(false);
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:467:8:
      467 │         this.fb.showToast(err?.error?.message || 'Hubo un error a...
          ╵         ~~~~


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:470:2:
      470 │   }
          ╵   ^


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:472:2:
      472 │   protected setRequestNature(nature: LeaveRequestNature): void {
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'setRequestNature'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:472:12:
      472 │   protected setRequestNature(nature: LeaveRequestNature): void {
          ╵             ~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'nature'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:472:29:
      472 │   protected setRequestNature(nature: LeaveRequestNature): void {
          ╵                              ~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:472:35:
      472 │   protected setRequestNature(nature: LeaveRequestNature): void {
          ╵                                    ^


X [ERROR] TS2693: 'LeaveRequestNature' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:472:37:
      472 │   protected setRequestNature(nature: LeaveRequestNature): void {
          ╵                                      ~~~~~~~~~~~~~~~~~~


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:472:56:
      472 │   protected setRequestNature(nature: LeaveRequestNature): void {
          ╵                                                         ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:473:8:
      473 │     this.requestNature.set(nature);
          ╵         ^


X [ERROR] TS2304: Cannot find name 'nature'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:473:27:
      473 │     this.requestNature.set(nature);
          ╵                            ~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:473:34:
      473 │     this.requestNature.set(nature);
          ╵                                   ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:474:8:
      474 │     this.clearSelection();
          ╵         ^


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:474:25:
      474 │     this.clearSelection();
          ╵                          ^


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:477:2:
      477 │   protected updateReason(event: Event): void {
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'updateReason'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:477:12:
      477 │   protected updateReason(event: Event): void {
          ╵             ~~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:477:30:
      477 │   protected updateReason(event: Event): void {
          ╵                               ^


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:477:38:
      477 │   protected updateReason(event: Event): void {
          ╵                                       ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:478:10:
      478 │     const target = event.target as HTMLTextAreaElement;
          ╵           ~~~~~~


X [ERROR] TS2304: Cannot find name 'target'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:478:10:
      478 │     const target = event.target as HTMLTextAreaElement;
          ╵           ~~~~~~


X [ERROR] TS18048: 'event' is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:478:19:
      478 │     const target = event.target as HTMLTextAreaElement;
          ╵                    ~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:478:54:
      478 │     const target = event.target as HTMLTextAreaElement;
          ╵                                                       ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:479:8:
      479 │     this.reason.set(target.value);
          ╵         ^


X [ERROR] TS2304: Cannot find name 'target'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:479:20:
      479 │     this.reason.set(target.value);
          ╵                     ~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:479:33:
      479 │     this.reason.set(target.value);
          ╵                                  ^


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:482:2:
      482 │   protected onFileSelected(event: Event): void {
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'onFileSelected'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:482:12:
      482 │   protected onFileSelected(event: Event): void {
          ╵             ~~~~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:482:32:
      482 │   protected onFileSelected(event: Event): void {
          ╵                                 ^


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:482:40:
      482 │   protected onFileSelected(event: Event): void {
          ╵                                         ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:483:10:
      483 │     const input = event.target as HTMLInputElement;
          ╵           ~~~~~


X [ERROR] TS2304: Cannot find name 'input'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:483:10:
      483 │     const input = event.target as HTMLInputElement;
          ╵           ~~~~~


X [ERROR] TS18048: 'event' is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:483:18:
      483 │     const input = event.target as HTMLInputElement;
          ╵                   ~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:483:50:
      483 │     const input = event.target as HTMLInputElement;
          ╵                                                   ^


X [ERROR] TS1003: Identifier expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:484:8:
      484 │     if (!input.files?.length) {
          ╵         ^


X [ERROR] TS7006: Parameter '(Missing)' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:484:8:
      484 │     if (!input.files?.length) {
          ╵         ^


X [ERROR] TS7006: Parameter 'input' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:484:9:
      484 │     if (!input.files?.length) {
          ╵          ~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:484:14:
      484 │     if (!input.files?.length) {
          ╵               ^


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:484:28:
      484 │     if (!input.files?.length) {
          ╵                             ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:484:30:
      484 │     if (!input.files?.length) {
          ╵                               ^


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:485:6:
      485 │       this.evidenceFile.set(null);
          ╵       ~~~~


X [ERROR] TS2304: Cannot find name 'input'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:489:17:
      489 │     const file = input.files[0];
          ╵                  ~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:494:6:
      494 │       this.fb.showToast('Solo se permiten archivos en formato PDF...
          ╵       ~~~~


X [ERROR] TS2304: Cannot find name 'input'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:495:6:
      495 │       input.value = '';
          ╵       ~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:496:6:
      496 │       this.evidenceFile.set(null);
          ╵       ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:503:6:
      503 │       this.fb.showToast(`El archivo excede el tamaño máximo per...
          ╵       ~~~~


X [ERROR] TS2304: Cannot find name 'input'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:504:6:
      504 │       input.value = '';
          ╵       ~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:505:6:
      505 │       this.evidenceFile.set(null);
          ╵       ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:509:4:
      509 │     this.evidenceFile.set(file);
          ╵     ~~~~


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:510:2:
      510 │   }
          ╵   ^


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:512:2:
      512 │   protected openEvidence(url: string | null): void {
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'openEvidence'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:512:12:
      512 │   protected openEvidence(url: string | null): void {
          ╵             ~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'url'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:512:25:
      512 │   protected openEvidence(url: string | null): void {
          ╵                          ~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:512:28:
      512 │   protected openEvidence(url: string | null): void {
          ╵                             ^


X [ERROR] TS2693: 'string' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:512:30:
      512 │   protected openEvidence(url: string | null): void {
          ╵                               ~~~~~~


X [ERROR] TS18050: The value 'null' cannot be used here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:512:39:
      512 │   protected openEvidence(url: string | null): void {
          ╵                                        ~~~~


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:512:44:
      512 │   protected openEvidence(url: string | null): void {
          ╵                                             ^


X [ERROR] TS1003: Identifier expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:513:8:
      513 │     if (!url) return;
          ╵         ^


X [ERROR] TS7006: Parameter '(Missing)' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:513:8:
      513 │     if (!url) return;
          ╵         ^


X [ERROR] TS7006: Parameter 'url' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:513:9:
      513 │     if (!url) return;
          ╵          ~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:513:14:
      513 │     if (!url) return;
          ╵               ~~~~~~


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:513:20:
      513 │     if (!url) return;
          ╵                     ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:516:10:
      516 │     const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
          ╵           ~~~~~~~


X [ERROR] TS2304: Cannot find name 'isImage'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:516:10:
      516 │     const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
          ╵           ~~~~~~~


X [ERROR] TS2304: Cannot find name 'url'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:516:20:
      516 │     const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
          ╵                     ~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:516:60:
      516 │     const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
          ╵                                                             ^


X [ERROR] TS7006: Parameter 'isImage' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:518:8:
      518 │     if (isImage) {
          ╵         ~~~~~~~


X [ERROR] TS2339: Property 'previewUrl' does not exist on type '{ if(: any, url: any): any; if(isImage: any): void; return: any; const: any; else: { window: Window & typeof globalThis; "": any; }; }'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:519:11:
      519 │       this.previewUrl.set(url);
          ╵            ~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'url'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:519:26:
      519 │       this.previewUrl.set(url);
          ╵                           ~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:520:6:
      520 │     } else {
          ╵       ~~~~


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:520:11:
      520 │     } else {
          ╵            ^


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:521:12:
      521 │       window.open(url, '_blank');
          ╵             ^


X [ERROR] TS2304: Cannot find name 'url'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:521:18:
      521 │       window.open(url, '_blank');
          ╵                   ~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:521:32:
      521 │       window.open(url, '_blank');
          ╵                                 ^


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:526:2:
      526 │   protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'onAcceptProposal'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:526:12:
      526 │   protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
          ╵             ~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:526:29:
      526 │   protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
          ╵                              ~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:526:33:
      526 │   protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
          ╵                                  ^


X [ERROR] TS2693: 'WorkerPermisoHistoryItem' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:526:35:
      526 │   protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
          ╵                                    ~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:526:60:
      526 │   protected onAcceptProposal(item: WorkerPermisoHistoryItem): void {
          ╵                                                             ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:527:8:
      527 │     this.fb.showConfirm(
          ╵         ^


X [ERROR] TS7006: Parameter 'confirmed' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:530:11:
      530 │     ).then(confirmed => {
          ╵            ~~~~~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:532:8:
      532 │         this.leaveService.updateStatus(item.id, {
          ╵         ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:532:39:
      532 │         this.leaveService.updateStatus(item.id, {
          ╵                                        ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:535:29:
      535 │           proposedStartDate: item.negotiation!.proposedStartDate,
          ╵                              ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:536:27:
      536 │           proposedEndDate: item.negotiation!.proposedEndDate,
          ╵                            ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:537:28:
      537 │           proposedSegments: item.negotiation!.proposedSegments
          ╵                             ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:539:10:
      539 │           this.fb.showToast('Solicitud actualizada y aprobada', '...
          ╵           ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:540:10:
      540 │           this.loadData();
          ╵           ~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:543:6:
      543 │     });
          ╵       ^


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:546:2:
      546 │   protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'onRejectProposal'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:546:12:
      546 │   protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
          ╵             ~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:546:29:
      546 │   protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
          ╵                              ~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:546:33:
      546 │   protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
          ╵                                  ^


X [ERROR] TS2693: 'WorkerPermisoHistoryItem' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:546:35:
      546 │   protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
          ╵                                    ~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:546:60:
      546 │   protected onRejectProposal(item: WorkerPermisoHistoryItem): void {
          ╵                                                             ^


X [ERROR] TS1005: ':' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:547:8:
      547 │     this.fb.showPrompt(
          ╵         ^


X [ERROR] TS7006: Parameter 'reason' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:551:11:
      551 │     ).then(reason => {
          ╵            ~~~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:554:6:
      554 │       this.leaveService.updateStatus(item.id, {
          ╵       ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:554:37:
      554 │       this.leaveService.updateStatus(item.id, {
          ╵                                      ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:558:8:
      558 │         this.fb.showToast('Propuesta rechazada. El administrador ...
          ╵         ~~~~


X [ERROR] TS2532: Object is possibly 'undefined'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:559:8:
      559 │         this.loadData();
          ╵         ~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:561:6:
      561 │     });
          ╵       ^


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:564:2:
      564 │   protected statusBadgeClass(status: WorkerPermisoHistoryStatus):...
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'statusBadgeClass'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:564:12:
      564 │   protected statusBadgeClass(status: WorkerPermisoHistoryStatus):...
          ╵             ~~~~~~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:564:35:
      564 │ ...otected statusBadgeClass(status: WorkerPermisoHistoryStatus): ...
          ╵                                   ^


X [ERROR] TS2693: 'WorkerPermisoHistoryStatus' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:564:37:
      564 │ ...ed statusBadgeClass(status: WorkerPermisoHistoryStatus): string {
          ╵                                ~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:564:64:
      564 │ ...ed statusBadgeClass(status: WorkerPermisoHistoryStatus): string {
          ╵                                                           ^


X [ERROR] TS1434: Unexpected keyword or identifier. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:564:66:
      564 │ ...ed statusBadgeClass(status: WorkerPermisoHistoryStatus): string {
          ╵                                                             ~~~~~~


X [ERROR] TS2693: 'string' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:564:66:
      564 │ ...ed statusBadgeClass(status: WorkerPermisoHistoryStatus): string {
          ╵                                                             ~~~~~~


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:577:2:
      577 │   protected statusLabel(status: WorkerPermisoHistoryStatus): stri...
          ╵   ~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'statusLabel'. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:577:12:
      577 │   protected statusLabel(status: WorkerPermisoHistoryStatus): stri...
          ╵             ~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:577:30:
      577 │   protected statusLabel(status: WorkerPermisoHistoryStatus): stri...
          ╵                               ^


X [ERROR] TS2693: 'WorkerPermisoHistoryStatus' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:577:32:
      577 │ ...otected statusLabel(status: WorkerPermisoHistoryStatus): string {
          ╵                                ~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS1005: ';' expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:577:59:
      577 │ ...otected statusLabel(status: WorkerPermisoHistoryStatus): string {
          ╵                                                           ^


X [ERROR] TS1434: Unexpected keyword or identifier. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:577:61:
      577 │ ...otected statusLabel(status: WorkerPermisoHistoryStatus): string {
          ╵                                                             ~~~~~~


X [ERROR] TS2693: 'string' only refers to a type, but is being used as a value here. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:577:61:
      577 │ ...otected statusLabel(status: WorkerPermisoHistoryStatus): string {
          ╵                                                             ~~~~~~


X [ERROR] TS1128: Declaration or statement expected. [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-permisos.component.ts:589:0:
      589 │ }
          ╵ ^


X [ERROR] Expected identifier but found ","

    src/app/pages/admin/admin-permisos.component.ts:665:7:
      665 │     if(, url) { }, return: ,
          ╵        ^


X [ERROR] Expected identifier but found ":"

    src/app/pages/trabajador/trabajador-permisos.component.ts:897:4:
      897 │     : .isSending() || this.isUploading(), return: ,
          ╵     ^


