PS H:\dev\ERP\erp-api> npm start    

> erp-api@0.0.1 start
> nest start

◇ injected env (10) from .env // tip: ◈ encrypted .env [www.dotenvx.com]
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [NestFactory] Starting Nest application...
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] AppModule dependencies initialized +11ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] PassportModule dependencies initialized +0ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] ConfigHostModule dependencies initialized +1ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] HealthModule dependencies initialized +0ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.     LOG [InstanceLoader] JwtModule dependencies initialized +131ms
[Nest] 13276  - 07/04/2026, 1:43:26 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
AggregateError [ECONNREFUSED]:
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:29 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (2)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:32 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (3)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:35 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (4)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:38 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (5)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:41 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (6)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:44 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (7)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:47 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (8)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:50 p.m.   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (9)...
AggregateError [ECONNREFUSED]: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7)
[Nest] 13276  - 07/04/2026, 1:43:50 p.m.   ERROR [ExceptionHandler] AggregateError [ECONNREFUSED]:
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:15433
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -4078,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 15433
    },
    Error: connect ECONNREFUSED 127.0.0.1:15433
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -4078,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 15433
    }
  ]
}
PS H:\dev\ERP\erp-api>