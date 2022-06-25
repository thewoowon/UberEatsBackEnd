import { Resolver,Query, Mutation, Args } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Resolver(of => User)
export class UsersResolver{
    constructor(
        private readonly usersService :UsersService
    ){}

    @Query(returns=> [User])
    users():Promise<User[]>{
        return this.usersService.usersAll();
    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(
        @Args('input') createAccountInput:CreateAccountInput
    ):Promise<CreateAccountOutput>{
      try{
        const {ok,error} = await this.usersService.createAccount(createAccountInput);

        return {
            ok:ok,
            error :error,
        }
      }
      catch(e){
        return {
            ok:false,
            error:e,
        }
      }
    }
}