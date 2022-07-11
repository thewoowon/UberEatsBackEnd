import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { RestaurantService } from "./restaurants.service";
import { User,UserRole } from "src/users/entities/user.entity";
import { AuthUser } from "src/auth/auth-user.decorator";
import { SetMetadata } from "@nestjs/common";
import { Role } from "src/auth/role.decorator";
import { EditProfileOutput } from "src/users/dtos/edit-profile.dto";
import { setMaxListeners } from "process";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";

 
@Resolver(of => Restaurant)
export class RestaurantResolver{
    constructor(private readonly restaurantService:RestaurantService){}
    @Mutation(returns => CreateRestaurantOutput)
    @Role(['Owner'])
    async createRestaurant(
        @AuthUser() authUser:User,
        @Args('input') createRestaurantInput:CreateRestaurantInput
    ):Promise<CreateRestaurantOutput>{
        return this.restaurantService.createRestaurant(authUser,createRestaurantInput);
    }

    @Mutation(returns => EditProfileOutput)
    @Role(['Owner'])
    async editRestaurant(
        @AuthUser() owner:User,
        @Args('input') editRestaurantInput:EditRestaurantInput
    ):Promise<EditRestaurantOutput>{
        return await this.restaurantService.editRestaurant(owner,editRestaurantInput)
    }

    @Mutation(returns => EditProfileOutput)
    @Role(['Owner'])
    async deleteRestaurant(
        @AuthUser() owner:User,
        @Args('input') deleteRestaurantInput:DeleteRestaurantInput
    ):Promise<DeleteRestaurantOutput>{
        return this.restaurantService.deleteRestaurant(owner,deleteRestaurantInput);
    }

}