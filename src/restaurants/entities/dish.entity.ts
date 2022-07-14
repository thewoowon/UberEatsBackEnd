import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType('DishOptionInputType',{isAbstract:true})
@ObjectType()
 export class DishOption{

    @Field(type => String)
    name:string;

    @Field(type => [String],{nullable:true})
    choices?:string[];

    @Field(type => Int,{nullable:true})
    extra?:number;
}


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

    @Field(type => String,{nullable:true})
    @Column({nullable:true})
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

    @Field(type => [DishOption],{nullable:true})
    @Column({type:"json",nullable:true})
    options:DishOption[]
}
