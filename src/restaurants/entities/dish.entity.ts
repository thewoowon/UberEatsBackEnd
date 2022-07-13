import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType('DishInputType',{isAbstract:true})
@ObjectType()
@Entity()
export class Dish extends CoreEntity{
    // 데이터 베이스와 상호 작용 할 수 있는 장치인 BaseEntity    

    @Field(type => String)
    @Column({unique:true})
    @IsString()
    @Length(5)
    name:string;

    @Field(type => Int)
    @Column()
    @IsNumber()
    price:number;

    @Field(type => String)
    @Column()
    @IsString()
    photo:string;

    @Field(type => String)
    @Column()
    @Length(5,140)
    description:string;

    @Field(type => Restaurant,{nullable:true})
    @ManyToOne(()=> Restaurant, restaurant => restaurant.menu,{nullable:false,onDelete:"CASCADE"})
    restaurant: Restaurant;

    @RelationId((dish:Dish)=> dish.restaurant)
    restaurantId:number;
}
