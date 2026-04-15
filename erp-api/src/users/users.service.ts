import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  /**
   * Login solo-PIN: entre usuarios activos el PIN debe ser único (mismo dígito → mismo hash no aplica por salt;
   * se compara bcrypt con cada fila).
   */
  async findActiveUserByUniquePin(pin: string): Promise<User | null> {
    const actives = await this.usersRepo.find({
      where: { activo: true },
      select: ['id', 'pinHash', 'role', 'fullName', 'username', 'activo'],
    });
    let matched: User | null = null;
    for (const u of actives) {
      const ok = await bcrypt.compare(pin, u.pinHash);
      if (ok) {
        if (matched) {
          throw new ConflictException(
            'Hay más de un usuario activo con el mismo PIN. Contacta al administrador.',
          );
        }
        matched = u;
      }
    }
    return matched;
  }

  /** Impide dos activos con el mismo PIN (login solo por PIN). */
  async assertPinUniqueAmongActive(
    plainPin: string,
    excludeUserId?: string,
  ): Promise<void> {
    const actives = await this.usersRepo.find({
      where: { activo: true },
      select: ['id', 'pinHash'],
    });
    for (const u of actives) {
      if (excludeUserId && u.id === excludeUserId) {
        continue;
      }
      if (await bcrypt.compare(plainPin, u.pinHash)) {
        throw new ConflictException(
          'El PIN ya está en uso; intenta con otro.',
        );
      }
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    const username = dto.username.trim().toLowerCase();
    const email = dto.email?.trim().toLowerCase() || null;

    const dupQb = this.usersRepo
      .createQueryBuilder('u')
      .where('LOWER(u.username) = :u', { u: username });
    if (email) {
      dupQb.orWhere('u.email = :e', { e: email });
    }
    const dupUser = await dupQb.getOne();
    if (dupUser) {
      throw new ConflictException(
        'Ese nombre de usuario o correo ya está registrado.',
      );
    }

    await this.assertPinUniqueAmongActive(dto.pin);

    const pinHash = await bcrypt.hash(dto.pin, BCRYPT_ROUNDS);
    const user = this.usersRepo.create({
      username,
      email,
      pinHash,
      role: dto.role,
      fullName: dto.fullName.trim(),
      puesto: dto.puesto?.trim() || null,
      fechaIngreso: dto.fechaIngreso ? new Date(dto.fechaIngreso) : null,
      activo: true,
    });
    return this.usersRepo.save(user);
  }

  async listActives(): Promise<User[]> {
    return this.usersRepo.find({
      where: { activo: true },
      order: { fullName: 'ASC' },
    });
  }

  async findAdmins(): Promise<User[]> {
    return this.usersRepo.find({
      where: { role: UserRole.ADMIN, activo: true },
    });
  }

  /** Listado administración: por nombre alfabéticamente. */
  async listForAdmin(): Promise<User[]> {
    return this.usersRepo
      .createQueryBuilder('u')
      .orderBy('u.fullName', 'ASC')
      .getMany();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }

    if (dto.username !== undefined) {
      const username = dto.username.trim().toLowerCase();
      const dupUser = await this.usersRepo
        .createQueryBuilder('u')
        .where('LOWER(u.username) = :uname', { uname: username })
        .andWhere('u.id != :id', { id })
        .getOne();
      if (dupUser) {
        throw new ConflictException(
          'Ese nombre de usuario o correo ya está registrado.',
        );
      }
      user.username = username;
    }

    if (dto.email !== undefined) {
      const email = dto.email?.trim().toLowerCase() || null;
      if (email) {
        const dupEmail = await this.usersRepo
          .createQueryBuilder('u')
          .where('u.email = :e', { e: email })
          .andWhere('u.id != :id', { id })
          .getOne();
        if (dupEmail) {
          throw new ConflictException(
            'Ese nombre de usuario o correo ya está registrado.',
          );
        }
      }
      user.email = email;
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName.trim();
    }

    if (dto.puesto !== undefined) {
      user.puesto = dto.puesto?.trim() || null;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    if (dto.pin !== undefined && dto.pin.trim() !== '') {
      await this.assertPinUniqueAmongActive(dto.pin, id);
      user.pinHash = await bcrypt.hash(dto.pin, BCRYPT_ROUNDS);
    }

    if (dto.fechaIngreso !== undefined) {
      user.fechaIngreso = dto.fechaIngreso ? new Date(dto.fechaIngreso) : null;
    }

    return this.usersRepo.save(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }
    if (!user.activo) {
      return user;
    }
    user.activo = false;
    user.inactivoDesde = new Date();
    return this.usersRepo.save(user);
  }

  async reactivate(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }
    if (user.activo) {
      return user;
    }
    user.activo = true;
    user.inactivoDesde = null;
    return this.usersRepo.save(user);
  }

  async setRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('usuario no encontrado');
    }
    user.role = role;
    return this.usersRepo.save(user);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      puesto: user.puesto,
      activo: user.activo,
      fechaIngreso: user.fechaIngreso
        ? (typeof user.fechaIngreso === 'string'
          ? (user.fechaIngreso as string).slice(0, 10)
          : (user.fechaIngreso as Date).toISOString().split('T')[0])
        : null,
      inactivoDesde: user.inactivoDesde,
      createdAt: user.createdAt,
    };
  }
}
