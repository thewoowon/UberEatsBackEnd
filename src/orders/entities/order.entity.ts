import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsNumber } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus{
    Pending = 'Pending',
    Cooking = 'Cooking',
    Picking = 'Picking',
    Delivered = 'Delivered',
}
registerEnumType(OrderStatus,{name:'OrderStatus'});

@InputType('OrderInputType',{isAbstract:true})
@ObjectType()
@Entity()
export class Order extends CoreEntity{
    @Field(type => User,{nullable:true})
    @ManyToOne( // 내가 다중 대상이 하나, 나는 주문 대상은 주문자
        type => User,
        user => user.orders,
        {nullable:true,onDelete:"SET NULL"}
    )
    customer?:User;

    @RelationId((order:Order) => order.customer)
    customerId:number;

    @Field(type => User,{nullable:true})
    @ManyToOne(
        type =>User,
        user=>user.rides,
        {nullable:true, onDelete:"SET NULL"}
    )
    driver?:User;

    @RelationId((order:Order) => order.driver)
    driverId:number;

    @Field(type => Restaurant)
    @ManyToOne(
        type => Restaurant,
        restaurant => restaurant.orders,
        {nullable:true, onDelete:"SET NULL"}
    )
    restaurant?:Restaurant;

    @Field(type => [OrderItem])
    @ManyToMany(type => OrderItem)
    @JoinTable()
    items: OrderItem[];

    @Column({nullable:true})
    @Field(type => Float,{nullable:true})
    @IsNumber()
    total: number;

    @Column({ type: 'enum', enum: OrderStatus ,default:OrderStatus.Pending})
    @Field(type => OrderStatus)
    @IsEnum(OrderStatus)
    status: OrderStatus;
}