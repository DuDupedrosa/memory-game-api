import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from './dto/createUserDto';
import { PrismaService } from 'src/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { SignInUserDto } from './dto/signInUserDto';
import { UserDataType, UserType } from 'src/types/user';
import { AuthService } from 'src/auth/auth.service';
import { EncryptionService } from 'src/common/encryption.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
    private encryptionService: EncryptionService,
  ) {}

  async createNewAsync(res: Response, newUserDto: CreateUserDto) {
    try {
      const findUserByEmail = await this.prismaService.user.findUnique({
        where: { email: newUserDto.email },
      });
      const findUserByNickName = await this.prismaService.user.findUnique({
        where: { nickName: newUserDto.nickName },
      });

      if (findUserByEmail) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'already_register_email' });
      }

      if (findUserByNickName) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'already_register_nickName' });
      }

      let data = { id: uuidv4(), ...newUserDto };
      data.password = this.encryptionService.encrypt(data.password);

      const createdUser = await this.prismaService.user.create({ data });

      const token = await this.authService.login({
        username: createdUser.nickName,
        userId: createdUser.id,
        email: createdUser.email,
      });

      let { password, ...userData }: UserType = createdUser;

      let response: { user: UserDataType; token: string } = {
        user: userData,
        token: token.access_token,
      };

      return res.status(HttpStatus.CREATED).json({ content: response });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `InternalServerErro|createNewAsync|Erro:${err}` });
    }
  }

  async signInUserAsync(res: Response, signInUserDto: SignInUserDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: signInUserDto.email },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user_by_email' });
      }

      const matchPassword = this.encryptionService.compare(
        signInUserDto.password,
        user.password,
      );

      if (!matchPassword) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'invalid_password' });
      }

      const token = await this.authService.login({
        username: user.nickName,
        userId: user.id,
        email: user.email,
      });

      let { password, ...userData }: UserType = user;

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      let response: { user: UserDataType; token: string } = {
        user: userData,
        token: token.access_token,
      };

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `InternalServerErro|signInUserAsync|Erro:${err}` });
    }
  }

  async getDataAsync(res: Response, userId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'not_found_user' });
      }

      let { password, ...userData }: UserType = user;

      let response: UserDataType = userData;

      return res.status(HttpStatus.OK).json({ content: response });
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: `InternalServerErro|getDataAsync|Erro:${err}` });
    }
  }

  async getUsersByListIds(usersIds: string[]): Promise<UserDataType[]> {
    try {
      const users = await this.prismaService.user.findMany({
        where: { id: { in: usersIds } },
      });

      const filteredUsers = users.map(({ password, ...user }) => user);

      return filteredUsers;
    } catch (err) {
      throw new Error(`InternalServerErro|getUsersByListIds|Erro:${err}`);
    }
  }
}
