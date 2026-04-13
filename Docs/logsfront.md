PS H:\dev\ERP\erp-web> npm start

> erp-web@0.0.0 start
> ng serve

Application bundle generation failed. [2.696 seconds] - 2026-04-13T21:13:15.168Z

X [ERROR] NG8004: No pipe found with name 'date'.
To fix this, import the "DatePipe" class from "@angular/common" and add it to the "imports" array of the component. [plugin angular-compiler]  

    src/app/pages/trabajador/trabajador-permisos.component.html:331:35:
      331 │ ...              {{ seg.start | date:'dd MMM' }} - {{ seg.end | d...
          ╵                                 ~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:28:15:
      28 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8004: No pipe found with name 'date'.
To fix this, import the "DatePipe" class from "@angular/common" and add it to the "imports" array of the component. [plugin angular-compiler]  

    src/app/pages/trabajador/trabajador-permisos.component.html:331:67:
      331 │ ...eg.start | date:'dd MMM' }} - {{ seg.end | date:'dd MMM, yyyy' }}
          ╵                                               ~~~~

  Error occurs in the template of component TrabajadorPermisosComponent.

    src/app/pages/trabajador/trabajador-permisos.component.ts:28:15:
      28 │   templateUrl: './trabajador-permisos.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Watch mode enabled. Watching for file changes...
