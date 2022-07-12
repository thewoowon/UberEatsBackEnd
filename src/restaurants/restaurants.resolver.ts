import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
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
import { Category } from "./entities/category.entity";
import { AllCategoriesOuput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";

 
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

    @Query(returns => RestaurantsOutput)
    restaurants(
        @Args('input') restaurantsInput:RestaurantsInput
    ):Promise<RestaurantsOutput>{
        return this.restaurantService.allRestaurants(restaurantsInput);
    }
    
    @Query(returns => RestaurantOutput)
    restaurant(
        @Args('input') restaurantInput:RestaurantInput,
    ):Promise<RestaurantOutput>{
        return this.restaurantService.findRestaurantById(restaurantInput);
    }

    @Query(returns => SearchRestaurantOutput)
    searchRestaurant(
      @Args('input') searchRestaurantInput: SearchRestaurantInput,
    ): Promise<SearchRestaurantOutput> {
      return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
    }
}


@Resolver(of =>Category)
export class CategoryResolver{
    constructor(private readonly restaurantService:RestaurantService){}

    @ResolveField(type => Number)
    restaurantCount(@Parent() category:Category):Promise<number>{
        return this.restaurantService.countRestaurants(category);
    }

    @Query(type => AllCategoriesOuput)
    allCategories():Promise<AllCategoriesOuput>{
        return this.restaurantService.allCategories();
    }

    @Query(type => CategoryOutput)
    category(@Args('input') categoryInput:CategoryInput):Promise<CategoryOutput>{
        return this.restaurantService.findCategoryBySlug(categoryInput);
    }

}
