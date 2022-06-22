import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
 
@Resolver(of => Restaurant)
export class RestaurantResolver{
    @Query(returns => Restaurant)
    restaurants(@Args('veganOnly') veganOnly:boolean):Restaurant[]{
        return [];
    }

    @Mutation(returns => Boolean)
    craeteRestaurant(
        @Args() createRestaurantInput:CreateRestaurantDto
    ):boolean{
        console.log(createRestaurantInput)
        return true;
    }
}