Page reload sent to client(s).
Initial chunk files | Names        |  Raw size
main.js             | main         |  39.89 kB |

Lazy chunk files    | Names        |  Raw size
chunk-XBTAA47G.js   | admin-routes | 394.58 kB |

Application bundle generation complete. [0.273 seconds] - 2026-04-09T16:29:01.639Z

Page reload sent to client(s).
Application bundle generation failed. [0.297 seconds] - 2026-04-09T16:29:07.736Z

X [ERROR] TS2488: Type 'Signal<{ id: string; name: string; puesto: string; }[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.html:165:28:
      165 │                 @for (op of delegationOps; track op.id) {
          ╵                             ~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(value: string | number, digitsInfo?: string | undefined, locale?: string | undefined): string | null', gave the following 
error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number'.
  Overload 2 of 3, '(value: null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): null', gave the following error.  
    Argument of type 'Signal<number>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(value: string | number | null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): string | null', 
gave the following error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number | null | undefined'. [plugin angular-compiler]   

    src/app/pages/admin/admin-produccion.component.html:178:88:
      178 │ ...ationTotal() | number }} / {{ delegationTarget | number }}</span>
          ╵                                  ~~~~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'reduce' does not exist on type 'Signal<{ id: string; name: string; puesto: string; }[]>'. [plugin angular-compiler]
    src/app/pages/admin/admin-produccion.component.ts:94:30:
      94 │     return this.delegationOps.reduce((s, o) => s + (Number(q[o.id]...
         ╵                               ~~~~~~


X [ERROR] TS7006: Parameter 's' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:38:
      94 │ ...urn this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) ||...
         ╵                                   ^


X [ERROR] TS7006: Parameter 'o' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:41:
      94 │ ... this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) || 0)...
         ╵                                   ^


Application bundle generation failed. [0.254 seconds] - 2026-04-09T16:29:13.563Z

X [ERROR] TS2488: Type 'Signal<{ id: string; name: string; puesto: string; }[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.html:165:28:
      165 │                 @for (op of delegationOps; track op.id) {
          ╵                             ~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(value: string | number, digitsInfo?: string | undefined, locale?: string | undefined): string | null', gave the following 
error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number'.
  Overload 2 of 3, '(value: null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): null', gave the following error.  
    Argument of type 'Signal<number>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(value: string | number | null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): string | null', 
gave the following error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number | null | undefined'. [plugin angular-compiler]   

    src/app/pages/admin/admin-produccion.component.html:178:88:
      178 │ ...ationTotal() | number }} / {{ delegationTarget | number }}</span>
          ╵                                  ~~~~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'reduce' does not exist on type 'Signal<{ id: string; name: string; puesto: string; }[]>'. [plugin angular-compiler]
    src/app/pages/admin/admin-produccion.component.ts:94:30:
      94 │     return this.delegationOps.reduce((s, o) => s + (Number(q[o.id]...
         ╵                               ~~~~~~


X [ERROR] TS7006: Parameter 's' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:38:
      94 │ ...urn this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) ||...
         ╵                                   ^


X [ERROR] TS7006: Parameter 'o' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:41:
      94 │ ... this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) || 0)...
         ╵                                   ^


Application bundle generation failed. [0.179 seconds] - 2026-04-09T16:29:31.810Z

▲ [WARNING] NG8113: All imports are unused [plugin angular-compiler]

    src/app/pages/trabajador/trabajador-produccion.component.ts:8:2:
      8 │   imports: [DecimalPipe, DatePipe],
        ╵   ~~~~~~~


X [ERROR] TS2488: Type 'Signal<{ id: string; name: string; puesto: string; }[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.html:165:28:
      165 │                 @for (op of delegationOps; track op.id) {
          ╵                             ~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(value: string | number, digitsInfo?: string | undefined, locale?: string | undefined): string | null', gave the following 
error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number'.
  Overload 2 of 3, '(value: null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): null', gave the following error.  
    Argument of type 'Signal<number>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(value: string | number | null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): string | null', 
gave the following error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number | null | undefined'. [plugin angular-compiler]   

    src/app/pages/admin/admin-produccion.component.html:178:88:
      178 │ ...ationTotal() | number }} / {{ delegationTarget | number }}</span>
          ╵                                  ~~~~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'reduce' does not exist on type 'Signal<{ id: string; name: string; puesto: string; }[]>'. [plugin angular-compiler]
    src/app/pages/admin/admin-produccion.component.ts:94:30:
      94 │     return this.delegationOps.reduce((s, o) => s + (Number(q[o.id]...
         ╵                               ~~~~~~


X [ERROR] TS7006: Parameter 's' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:38:
      94 │ ...urn this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) ||...
         ╵                                   ^


X [ERROR] TS7006: Parameter 'o' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:41:
      94 │ ... this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) || 0)...
         ╵                                   ^


Application bundle generation failed. [0.193 seconds] - 2026-04-09T16:29:48.791Z

X [ERROR] TS2488: Type 'Signal<{ id: string; name: string; puesto: string; }[]>' must have a '[Symbol.iterator]()' method that returns an iterator. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.html:165:28:
      165 │                 @for (op of delegationOps; track op.id) {
          ╵                             ~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(value: string | number, digitsInfo?: string | undefined, locale?: string | undefined): string | null', gave the following 
error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number'.
  Overload 2 of 3, '(value: null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): null', gave the following error.  
    Argument of type 'Signal<number>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(value: string | number | null | undefined, digitsInfo?: string | undefined, locale?: string | undefined): string | null', 
gave the following error.
    Argument of type 'Signal<number>' is not assignable to parameter of type 'string | number | null | undefined'. [plugin angular-compiler]   

    src/app/pages/admin/admin-produccion.component.html:178:88:
      178 │ ...ationTotal() | number }} / {{ delegationTarget | number }}</span>
          ╵                                  ~~~~~~~~~~~~~~~~

  Error occurs in the template of component AdminProduccionComponent.

    src/app/pages/admin/admin-produccion.component.ts:14:15:
      14 │   templateUrl: './admin-produccion.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'reduce' does not exist on type 'Signal<{ id: string; name: string; puesto: string; }[]>'. [plugin angular-compiler]
    src/app/pages/admin/admin-produccion.component.ts:94:30:
      94 │     return this.delegationOps.reduce((s, o) => s + (Number(q[o.id]...
         ╵                               ~~~~~~


X [ERROR] TS7006: Parameter 's' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:38:
      94 │ ...urn this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) ||...
         ╵                                   ^


X [ERROR] TS7006: Parameter 'o' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/pages/admin/admin-produccion.component.ts:94:41:
      94 │ ... this.delegationOps.reduce((s, o) => s + (Number(q[o.id]) || 0)...
         ╵                                   ^


