import { IsArray, ValidateNested, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class WasteItemDto {
  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  productName: string;

  @IsString()
  @IsOptional()
  itemType?: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReportWasteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WasteItemDto)
  items: WasteItemDto[];
}
