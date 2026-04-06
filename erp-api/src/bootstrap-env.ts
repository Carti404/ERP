/** Debe importarse antes que `AppModule` para que `.env` pise variables de sistema (override). */
import { loadErpEnvFile } from './database/load-erp-env';

loadErpEnvFile();
