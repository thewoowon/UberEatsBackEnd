import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

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

    @Field(type => User,{nullable:true})
    @ManyToOne(
        type =>User,
        user=>user.rides,
        {nullable:true, onDelete:"SET NULL"}
    )
    driver?:User;

    @Field(type => Restaurant)
    @ManyToOne(
        type => Restaurant,
        restaurant => restaurant.orders,
        {nullable:true, onDelete:"SET NULL"}
    )
    restaurant:Restaurant;

    @Field(type => [Dish])
    @ManyToMany(type => Dish)
    @JoinTable()
    dishes: Dish[];

    @Column()
    @Field(type => Float)
    total: number;

    @Column({ type: 'enum', enum: OrderStatus })
    @Field(type => OrderStatus)
    status: OrderStatus;
}