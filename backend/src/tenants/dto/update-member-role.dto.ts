import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/entities/user.entity';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;
}
