import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { RestaurantService } from "./restaurants.service";
import { UpdateRestaurantDto } from "./dtos/update-restaurant.dto";
 
@Resolver(of => Restaurant)
export class RestaurantResolver{
    constructor(private readonly restaurantService:RestaurantService){}

    @Query(returns => [Restaurant])
    restaurants():Promise<Restaurant[]>{
        return this.restaurantService.getAll();
    }

    @Mutation(returns => Boolean)
    async createRestaurant(
        @Args('input') createRestaurantInput:CreateRestaurantDto
    ):Promise<boolean>{console.log(createRestaurantInput)
        try{
            await this.restaurantService.createRestaurant(createRestaurantInput);
            return true;
        }
        catch(e)
        {
            console.log(e);
            return false;
        }
    }

    @Mutation(returns => Boolean)
    async updateRestaurant(
        @Args('input') updateRestaurantDto:UpdateRestaurantDto):Promise<Boolean>{
        try{
            await this.restaurantService.updaterestaurant(updateRestaurantDto);
            return true;
        }
        catch(e){
         console.log(e);
         return false;
        }
    }
}