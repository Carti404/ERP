import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { HolidayInputDto, PutSystemParametersDto, UpdateHolidaysDto, UpdateScheduleDto } from './dto/put-system-parameters.dto';
import { Holiday } from './entities/holiday.entity';
import { PlantRestSettings } from './entities/plant-rest-settings.entity';
import { WorkScheduleBlock } from './entities/work-schedule-block.entity';

const PLANT_SETTINGS_ID = 1;
const KEY_MON_FRI = 'mon_fri';
const KEY_SATURDAY = 'saturday';

function toHm(t: string): string {
  const s = t.trim();
  if (s.length >= 5) {
    return s.slice(0, 5);
  }
  return s;
}

function holidayDateToIso(d: string | Date): string {
  if (typeof d === 'string') {
    return d.slice(0, 10);
  }
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type SystemParametersResponse = {
  monFri: {
    entry: string;
    exit: string;
    tolerance: number;
  };
  saturday: {
    entry: string;
    exit: string;
    tolerance: number;
  };
  snackMin: number;
  lunchFrom: string;
  lunchDurationMin: number;
  vacationDeductionDays?: number;
  holidays: { id: string; date: string; title: string; sub: string }[];
};

@Injectable()
export class SystemParametersService {
  constructor(
    @InjectRepository(WorkScheduleBlock)
    private readonly blocksRepo: Repository<WorkScheduleBlock>,
    @InjectRepository(PlantRestSettings)
    private readonly restRepo: Repository<PlantRestSettings>,
    @InjectRepository(Holiday)
    private readonly holidaysRepo: Repository<Holiday>,
    private readonly dataSource: DataSource,
  ) {}

  async getSnapshot(): Promise<SystemParametersResponse> {
    const [monFri, saturday, rest, holidays] = await Promise.all([
      this.blocksRepo.findOne({ where: { blockKey: KEY_MON_FRI } }),
      this.blocksRepo.findOne({ where: { blockKey: KEY_SATURDAY } }),
      this.restRepo.findOne({ where: { id: PLANT_SETTINGS_ID } }),
      this.holidaysRepo.find({ order: { holidayDate: 'ASC' } }),
    ]);

    if (!monFri || !saturday || !rest) {
      throw new NotFoundException(
        'Faltan datos de parámetros del sistema; ejecuta migraciones.',
      );
    }

    return {
      monFri: {
        entry: toHm(monFri.startTime),
        exit: toHm(monFri.endTime),
        tolerance: monFri.toleranceMinutes,
      },
      saturday: {
        entry: toHm(saturday.startTime),
        exit: toHm(saturday.endTime),
        tolerance: saturday.toleranceMinutes,
      },
      snackMin: rest.snackNominalMinutes,
      lunchFrom: toHm(rest.lunchFromTime),
      lunchDurationMin: rest.lunchDurationMinutes,
      vacationDeductionDays: holidays.filter(h => {
        const dateStr = typeof h.holidayDate === 'string' ? h.holidayDate : holidayDateToIso(h.holidayDate);
        const y = parseInt(dateStr.split('-')[0], 10);
        return y === new Date().getFullYear();
      }).length,
      holidays: holidays.map((h) => ({
        id: h.id,
        date: holidayDateToIso(h.holidayDate),
        title: h.title,
        sub: h.description ?? '',
      })),
    };
  }

  async replaceAll(dto: PutSystemParametersDto): Promise<SystemParametersResponse> {
    await this.dataSource.transaction(async (manager) => {
      const monFri = await manager.findOne(WorkScheduleBlock, {
        where: { blockKey: KEY_MON_FRI },
      });
      const saturday = await manager.findOne(WorkScheduleBlock, {
        where: { blockKey: KEY_SATURDAY },
      });
      if (!monFri || !saturday) {
        throw new NotFoundException('Bloques de jornada no encontrados.');
      }

      monFri.startTime = toHm(dto.monFri.entry);
      monFri.endTime = toHm(dto.monFri.exit);
      monFri.toleranceMinutes = dto.monFri.tolerance;
      await manager.save(WorkScheduleBlock, monFri);

      saturday.startTime = toHm(dto.saturday.entry);
      saturday.endTime = toHm(dto.saturday.exit);
      saturday.toleranceMinutes = dto.saturday.tolerance;
      await manager.save(WorkScheduleBlock, saturday);

      const rest = await manager.findOne(PlantRestSettings, {
        where: { id: PLANT_SETTINGS_ID },
      });
      if (!rest) {
        throw new NotFoundException('Parámetros de descanso no encontrados.');
      }
      rest.snackNominalMinutes = dto.snackMin;
      rest.lunchFromTime = toHm(dto.lunchFrom);
      rest.lunchDurationMinutes = dto.lunchDurationMin;
      await manager.save(PlantRestSettings, rest);

      await manager.query('DELETE FROM holidays');
      if (dto.holidays.length > 0) {
        const hRows = dto.holidays.map(h => manager.create(Holiday, {
          holidayDate: h.date.slice(0, 10),
          title: h.title.trim(),
          description: h.sub?.trim() || null,
        }));
        await manager.save(Holiday, hRows);
      }
    });

    return this.getSnapshot();
  }

  async updateSchedule(dto: UpdateScheduleDto): Promise<SystemParametersResponse> {
    await this.dataSource.transaction(async (manager) => {
      const monFri = await manager.findOne(WorkScheduleBlock, {
        where: { blockKey: KEY_MON_FRI },
      });
      const saturday = await manager.findOne(WorkScheduleBlock, {
        where: { blockKey: KEY_SATURDAY },
      });
      if (!monFri || !saturday) {
        throw new NotFoundException('Bloques de jornada no encontrados.');
      }

      monFri.startTime = toHm(dto.monFri.entry);
      monFri.endTime = toHm(dto.monFri.exit);
      monFri.toleranceMinutes = dto.monFri.tolerance;
      await manager.save(WorkScheduleBlock, monFri);

      saturday.startTime = toHm(dto.saturday.entry);
      saturday.endTime = toHm(dto.saturday.exit);
      saturday.toleranceMinutes = dto.saturday.tolerance;
      await manager.save(WorkScheduleBlock, saturday);

      const rest = await manager.findOne(PlantRestSettings, {
        where: { id: PLANT_SETTINGS_ID },
      });
      if (!rest) {
        throw new NotFoundException('Parámetros de descanso no encontrados.');
      }
      rest.snackNominalMinutes = dto.snackMin;
      rest.lunchFromTime = toHm(dto.lunchFrom);
      rest.lunchDurationMinutes = dto.lunchDurationMin;
      await manager.save(PlantRestSettings, rest);
    });

    return this.getSnapshot();
  }

  async updateHolidays(dto: UpdateHolidaysDto): Promise<SystemParametersResponse> {
    await this.dataSource.transaction(async (manager) => {
      await manager.query('DELETE FROM holidays');
      if (dto.holidays.length > 0) {
        const hRows = dto.holidays.map(h => manager.create(Holiday, {
          holidayDate: h.date.slice(0, 10),
          title: h.title.trim(),
          description: h.sub?.trim() || null,
        }));
        await manager.save(Holiday, hRows);
      }
    });

    return this.getSnapshot();
  }
}
