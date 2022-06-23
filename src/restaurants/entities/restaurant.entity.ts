import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant{

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
}
