import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { RestaurantService } from "./restaurants.service";
 
@Resolver(of => Restaurant)
export class RestaurantResolver{
    constructor(private readonly restaurantService:RestaurantService){}

    @Query(returns => [Restaurant])
    restaurants():Promise<Restaurant[]>{
        return this.restaurantService.getAll();
    }

    @Mutation(returns => Boolean)
    async createRestaurant(
        @Args() createRestaurantInput:CreateRestaurantDto
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
}