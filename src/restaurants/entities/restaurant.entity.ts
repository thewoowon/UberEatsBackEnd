import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { Dish } from "./dish.entity";


@InputType('RestaurantInputType',{isAbstract:true})
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity{
    // 데이터 베이스와 상호 작용 할 수 있는 장치인 BaseEntity    

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name:string;

    @Field(type=>String)
    @Column()
    @IsString()
    coverImg:string;

    @Field(type => String)
    @Column()
    @IsString()
    address:string;

    @Field(type => Category,{nullable:true})
    @ManyToOne(()=> Category,category => category.restaurants,{nullable:true,onDelete:"SET NULL"})
    category: Category;

    @Field(type => User,{nullable:true})
    @ManyToOne(()=> User,user => user.restaurants,{nullable:true,onDelete:"CASCADE"})
    owner: User;

    @RelationId((restaurant:Restaurant)=> restaurant.owner)
    ownerId:number;

    @Field(type => [Order])
    @OneToMany(
        type => Order,
        order => order.restaurant,
    )
    orders: Order[];

    @Field(type =>[Dish])
    @OneToMany(type => Dish,dish => dish.restaurant)
    menu:Dish[];

    @Field(type => Boolean)
    @Column({default:false})
    isPromoted:boolean;

    @Field(type => Date,{nullable:true})
    @Column({nullable:true})
    promotedUntil:Date;
}
