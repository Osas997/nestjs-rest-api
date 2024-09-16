import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { AuthResponse } from 'src/interface/auth';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dtos/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const sameUsername = await this.userRepository.findOneBy({
      username: registerDto.username,
    });

    if (sameUsername) {
      throw new HttpException('Username already exists', 400);
    }

    registerDto.password = await bcrypt.hash(registerDto.password, 10);

    const user = await this.userRepository.save({
      ...registerDto,
      role: Role.USER,
    });

    return {
      username: user.username,
      name: user.name,
      role: user.role,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOneBy({
      username: loginDto.username,
    });

    if (!user) {
      throw new HttpException('Invalid username or password', 404);
    }

    const password = await bcrypt.compare(loginDto.password, user.password);

    if (!password) {
      throw new HttpException('Invalid username or password', 404);
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '20m',
      secret: this.configService.get('SECRET_KEY'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get('REFRESH_SECRET_KEY'),
    });

    await this.userRepository.update(user.id, {
      refresh_token: refreshToken,
    });

    return {
      name: user.name,
      username: user.username,
      role: user.role,
      token: token,
      refresh_token: refreshToken,
    };
  }

  async refresh(refreshDto: RefreshTokenDto): Promise<string> {
    try {
      const decoded = await this.jwtService.verifyAsync(
        refreshDto.refresh_token,
        {
          secret: this.configService.get('REFRESH_SECRET_KEY'),
        },
      );

      const user = await this.userRepository.findOneBy({ id: decoded.id });

      if (!user || user.refresh_token !== refreshDto.refresh_token) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const payload = {
        id: user.id,
        role: user.role,
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '20m',
        secret: this.configService.get('SECRET_KEY'),
      });

      return token;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
