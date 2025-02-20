import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUserDto';
import { Response } from 'express';
import { SignInUserDto } from './dto/signInUserDto';
import { RequestWithUser } from 'src/types/request';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UpdateUserDto } from './dto/updateUserDto';
import { ChangeUserPasswordDto } from './dto/changeuserPasswordDto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createNew(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    return await this.userService.createNewAsync(response, createUserDto);
  }

  @Post('sign-in')
  async signIn(
    @Body() singInUserDto: SignInUserDto,
    @Res() response: Response,
  ) {
    return await this.userService.signInUserAsync(response, singInUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getData(
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return this.userService.getDataAsync(response, requestWithUser.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUserProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.userService.updateUserProfileAsync(
      response,
      updateUserDto,
      requestWithUser.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Body() changeUserPasswordDto: ChangeUserPasswordDto,
    @Res() response: Response,
    @Req() requestWithUser: RequestWithUser,
  ) {
    return await this.userService.changePasswordAsync(
      response,
      changeUserPasswordDto,
      requestWithUser.user.userId,
    );
  }
}
