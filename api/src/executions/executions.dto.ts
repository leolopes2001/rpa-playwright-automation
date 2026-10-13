import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ExecutionStatus } from '@prisma/client';

export class CreateExecutionDto {
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url!: string;
}

export class ListExecutionsDto {
  @IsOptional()
  @IsEnum(ExecutionStatus)
  status?: ExecutionStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @Transform(({ value }) => String(value))
  cursor?: string;
}
