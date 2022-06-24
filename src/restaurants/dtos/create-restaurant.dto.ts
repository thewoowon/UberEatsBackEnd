import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { IsBoolean, isBoolean, IsString, isString, Length } from "class-validator";

@ArgsType()
export class CreateRestaurantDto{

    @Field(type=>String)
    @IsString()
    @Length(5,10)
    public name:string;

    @Field(type=>Boolean)
    @IsBoolean()
    public isVegan:boolean;

    @Field(type=>String)
    @IsString()
    address:string;

    @Field(type=>String)
    @IsString()
    ownerName:string;

    @Field(type=>String)
    @IsString()
    categoryName:string;

}