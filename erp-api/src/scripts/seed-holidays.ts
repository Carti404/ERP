import axios from 'axios';
import { DataSource } from 'typeorm';
import { dbConnectionEnv, loadErpEnvFile } from '../database/load-erp-env';
import { Holiday } from '../system-parameters/entities/holiday.entity';

loadErpEnvFile();
const db = dbConnectionEnv();

async function main() {
  const common = {
    type: 'postgres' as const,
    entities: [Holiday],
    synchronize: false,
  };
  const ds = new DataSource(
    db.useUrl
      ? { ...common, url: db.url }
      : {
          ...common,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
        },
  );
  await ds.initialize();
  const repo = ds.getRepository(Holiday);

  console.log('Limpiando tabla de festivos...');
  await repo.clear();

  const startYear = 2024;
  const endYear = 2030;
  const allHolidays: Partial<Holiday>[] = [];

  for (let y = startYear; y <= endYear; y++) {
    console.log(`Obteniendo festivos para México en ${y}...`);
    try {
      const resp = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${y}/MX`);
      if (Array.isArray(resp.data)) {
        for (const h of resp.data) {
          // Solo incluir los de tipo "Public" (obligatorios por Ley Federal del Trabajo).
          // Se excluyen "Bank", "School", "Authorities" que no son descanso obligatorio.
          const types: string[] = h.types ?? [];
          if (!types.includes('Public')) {
            continue;
          }
          allHolidays.push({
            holidayDate: h.date,
            title: h.localName,
            description: `Festivo oficial (API Nager.Date - ${h.name})`,
          });
        }
      }
    } catch (error) {
      console.error(`Error al obtener datos para el año ${y}:`, error.message);
    }
  }

  if (allHolidays.length > 0) {
    console.log(`Guardando ${allHolidays.length} festivos en la base de datos...`);
    await repo.save(allHolidays);
    console.log('Sincronización de festivos completada exitosamente.');
  } else {
    console.warn('No se encontraron festivos para guardar.');
  }

  await ds.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
