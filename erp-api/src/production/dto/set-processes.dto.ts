import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessRecipeItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  @IsOptional()
  itemType?: string;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class ProcessItemDto {
  @IsInt()
  @Min(1)
  orderIndex: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  estimatedTimeValue: number;

  @IsString()
  @IsOptional()
  estimatedTimeUnit?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessRecipeItemDto)
  @IsOptional()
  recipeItems?: ProcessRecipeItemDto[];
}

export class SetProcessesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessItemDto)
  processes: ProcessItemDto[];

  @IsInt()
  @Min(0)
  @IsOptional()
  totalEstimatedTimeValue?: number;

  @IsString()
  @IsOptional()
  totalEstimatedTimeUnit?: string;
}
