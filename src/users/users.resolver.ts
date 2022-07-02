import { Resolver,Query, Mutation, Args, Context } from "@nestjs/graphql";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { query } from "express";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthUser } from "src/auth/auth-user.decorator";
import { UseProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { VerifyEmailInput, VerifyEmailOutput } from "./dtos/verify-email.dto";

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
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser:User){
        return authUser
    }
    
    @UseGuards(AuthGuard)
    @Query(returns=>UserProfileOutput)
    async userProfile(@Args() userProfileInput:UseProfileInput):Promise<UserProfileOutput>{
        return await this.usersService.findById(userProfileInput.userId);
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(@AuthUser() authUser:User, @Args('input') EditProfileInput:EditProfileInput):Promise<EditProfileOutput>{
        try{
            await this.usersService.editProfile(authUser.id,EditProfileInput);
            return {
                ok:true,
            }
        }
        catch(e){
            return{
                ok:false,
                error:e,
            }
        }
    }

    @Mutation(returns =>VerifyEmailOutput)
    async verifyEmail(@Args('input') verifyEmailInput:VerifyEmailInput):Promise<VerifyEmailOutput>{
        try{
            await this.usersService.verifyEmail(verifyEmailInput.code);
            return{
                ok:true,
            }
        }
        catch(e){
            return {
                ok:false,
                error:e
            }
        }
    }
}