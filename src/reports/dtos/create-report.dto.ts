import {IsLatitude, IsLongitude, IsString, Max, Min} from "class-validator";

export class CreateReportDto {
    @Min(0)
    price: number;

    @IsString()
    make: string;

    @IsString()
    model: string;

    @Min(1970)
    @Max(2050)
    year: number;

    @IsLongitude()
    lng: number;

    @IsLatitude()
    lat: number;

    @Min(0)
    @Max(1000000)
    mileage: number;
}