import { ArgsType, Field } from "@nestjs/graphql";

@ArgsType()
export class UseProfileInput{
    @Field(type => Number)
    userId:number;
}