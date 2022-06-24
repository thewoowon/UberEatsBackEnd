import { ArgsType, Field, InputType, OmitType, PartialType } from "@nestjs/graphql";
import { Restaurant } from "../entities/restaurant.entity";
import { CreateRestaurantDto } from "./create-restaurant.dto";

@InputType()
export class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto){}

@InputType()
export class UpdateRestaurantDto {
    @Field(type => Number)
    id:number;

    @Field(type => UpdateRestaurantInputType)
    data:UpdateRestaurantInputType;

}