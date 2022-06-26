import { Resolver,Query, Mutation, Args } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { query } from "express";

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
        return this.usersService.createAccount(createAccountInput);
      }
      catch(e){
        return {
            ok:false,
            error:e,
        }
      }
    }


    @Mutation(returns => LoginOutput)
    async login(
        @Args('input') loginInput: LoginInput
    ): Promise<LoginOutput>{
        try{
            return this.usersService.login(loginInput);
        }
        catch(e){
            return {
                ok:false,
                error:e
            }
        }
    }

    @Query(returns=>User)
    me(){
        
    }

}