import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123def456...', description: 'Password reset token from email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecurePassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
