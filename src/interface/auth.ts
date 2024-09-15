import { Role, User } from 'src/entities/user.entity';
import type { Request } from 'express';

export class AuthResponse {
  username: string;
  name: string;
  role: Role;
  token?: string;
  refresh_token?: string;
}

export class AuthRequest extends Request {
  user: User;
}
