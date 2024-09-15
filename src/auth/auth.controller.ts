import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { WebResponse } from 'src/interface/web-response';
import { AuthResponse } from 'src/interface/auth';
import { LoginDto } from './dtos/login.dto';
import { User } from 'src/common/decorator/user.decorator';

@Controller('/api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @HttpCode(201)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<WebResponse<AuthResponse>> {
    const user = await this.authService.register(registerDto);
    return {
      data: user,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<WebResponse<AuthResponse>> {
    const user = await this.authService.login(loginDto);
    return {
      data: user,
    };
  }

  @Get('/me')
  me(@User() user) {
    return {
      data: user,
    };
  }
}
