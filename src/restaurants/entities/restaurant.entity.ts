import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./category.entity";


@InputType({isAbstract:true})
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

    @Field(type => String)
    @Column()
    ownerName:string;

    @Field(type => String)
    @Column()
    @IsString()
    categoryName:string;

    @ManyToOne(()=> Category,category => category.restaurants)
    category: Category;
}
