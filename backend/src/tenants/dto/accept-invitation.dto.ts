import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AcceptInvitationDto {
  @ApiPropertyOptional({
    description: 'Password for new user (if accepting invitation without existing account)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'Full name for new user',
    example: 'John Smith',
  })
  @IsOptional()
  @IsString()
  fullName?: string;
}
