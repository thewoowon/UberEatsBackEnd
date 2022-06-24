import { Field, ObjectType } from "@nestjs/graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant{
    // 데이터 베이스와 상호 작용 할 수 있는 장치인 BaseEntity
    @Field(type => Number)
    @PrimaryGeneratedColumn()
    id:number

    @Field(type => String)
    @Column()
    name:string;

    @Field(type => Boolean,{nullable:true})
    @Column()
    isVegan?:boolean;

    @Field(type => String)
    @Column()
    address:string;

    @Field(type => String)
    @Column()
    ownerName:string;

    @Field(type => String)
    @Column()
    categoryName:string;

}
