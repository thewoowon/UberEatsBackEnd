import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";


//@InputType({isAbstract:true})
@ObjectType()
@Entity()
export class Restaurant{
    // 데이터 베이스와 상호 작용 할 수 있는 장치인 BaseEntity
    @Field(type => Number)
    @PrimaryGeneratedColumn()
    id:number

    @Field(type => String)
    @Column()
    @IsString()
    @Length(5)
    name:string;

    @Field(type => Boolean,{defaultValue:true,nullable:true})
    @Column({default:true})
    @IsBoolean()
    @IsOptional()
    isVegan?:boolean;

    @Field(type => String)
    @Column()
    @IsString()
    address:string;

    @Field(type => String)
    @Column()
    ownerName:string;

    @Field(type => String)
    @Column()
    @IsString()
    categoryName:string;

}
