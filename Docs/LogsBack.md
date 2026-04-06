PS H:\dev\ERP\erp-api> npm run db:setup

> erp-api@0.0.1 db:setup
> npm run build && npm run typeorm -- migration:run -d dist/database/data-source.js && npm run seed:admin


> erp-api@0.0.1 build
> nest build


> erp-api@0.0.1 typeorm
> typeorm-ts-node-commonjs migration:run -d dist/database/data-source.js

◇ injected env (10) from .env // tip: ⌘ suppress logs { quiet: true }
query: SELECT version()
query: SELECT * FROM current_schema()
query: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public' AND "table_name" = 'migrations'
query: SELECT * FROM "migrations" "migrations" ORDER BY "id" DESC
No migrations are pending

> erp-api@0.0.1 seed:admin
> ts-node -r tsconfig-paths/register src/scripts/seed-admin.ts

◇ injected env (10) from .env // tip: ⌘ override existing { override: true }
Ya existen usuarios; no se crea seed.
PS H:\dev\ERP\erp-api> 