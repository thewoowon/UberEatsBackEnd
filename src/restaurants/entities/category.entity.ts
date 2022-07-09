import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";


@InputType({isAbstract:true})
@ObjectType()
@Entity()
export class Category extends CoreEntity{
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

    @OneToMany(type => Restaurant,restaurant => restaurant.category)
    restaurants:Restaurant[];
}
