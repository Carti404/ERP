export type ErpUserRole = 'admin' | 'worker';

export interface ErpUserPublic {
  id: string;
  username: string;
  email: string | null;
  role: ErpUserRole;
  fullName: string;
  puesto: string | null;
  activo: boolean;
  inactivoDesde?: string | null;
  createdAt: string;
}

export interface CreateUserPayload {
  username: string;
  fullName: string;
  pin: string;
  role: ErpUserRole;
  email?: string;
  puesto?: string;
}

export interface UpdateUserPayload {
  username: string;
  fullName: string;
  role: ErpUserRole;
  email: string | null;
  puesto: string | null;
  pin?: string;
}
