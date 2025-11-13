import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/entities/user.entity';

export class InviteMemberDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MEMBER })
  @IsEnum(UserRole)
  role: UserRole;
}
