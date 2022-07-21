import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";

@InputType('PaymentInputType',{isAbstract:true})
@ObjectType()
@Entity()
export class Payment extends CoreEntity{
    @Field(type => Int)
    @Column()
    transactionId:number;
    
    @Field(type => User,{nullable:true})
    @ManyToOne( // 내가 다중 대상이 하나, 나는 주문 대상은 주문자
        type => User,
        user => user.payments,
    )
    user?:User;

    @RelationId((order:Order) => order.customer)
    userId:number;
}