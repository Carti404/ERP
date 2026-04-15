[Nest] 15752  - 15/04/2026, 3:13:54 p.m.     LOG [NestApplication] Nest application successfully started +13ms
[Nest] 15752  - 15/04/2026, 3:13:54 p.m.   ERROR [NestApplication] Error: listen EADDRINUSE: address already in use :::3005 +2ms
node:net:1940
    const ex = new UVExceptionWithHostPort(err, 'listen', address, port);
               ^

Error: listen EADDRINUSE: address already in use :::3005
    at Server.setupListenHandle [as _listen2] (node:net:1940:16)
    at listenInCluster (node:net:1997:12)
    at Server.listen (node:net:2102:7)
    at ExpressAdapter.listen (H:\dev\ERP\erp-api\node_modules\@nestjs\platform-express\adapters\express-adapter.js:115:32)
    at H:\dev\ERP\erp-api\node_modules\@nestjs\core\nest-application.js:188:30
    at new Promise (<anonymous>)
    at NestApplication.listen (H:\dev\ERP\erp-api\node_modules\@nestjs\core\nest-application.js:178:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async bootstrap (H:\dev\ERP\erp-api\src\main.ts:35:3) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3005
}
