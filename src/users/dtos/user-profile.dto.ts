import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@ArgsType()
export class UseProfileInput{
    @Field(type => Number)
    userId:number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput{

    @Field(type => User)
    user:User;
}