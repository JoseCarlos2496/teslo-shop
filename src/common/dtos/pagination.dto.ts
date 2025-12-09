import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    
    @IsOptional()
    @IsPositive()
    @Type(() => Number) //enableImplicitConversion: true
    readonly limit?: number;
    
    @IsOptional()
    @Min(0)
    @Type(() => Number) //enableImplicitConversion: true
    readonly offset?: number;
}
