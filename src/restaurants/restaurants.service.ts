import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, In, Like, RelationId, Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOuput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.sto";
import { create } from "domain";
import { Dish } from "./entities/dish.entity";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants:Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes:Repository<Dish>,
        private readonly categories:CategoryRepository,
        ){}

    async createRestaurant(
        owner:User,
        createRestaurantInput: CreateRestaurantInput):Promise<CreateRestaurantOutput>{
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;
            const category = await this.categories.getOrCreate(
                createRestaurantInput.categoryName
            );
            newRestaurant.category = category;
            await this.restaurants.save(newRestaurant);
            return {
                ok:true,
            }
        }
        catch(e)
        {
            return{
                ok:false,
                error:"Could not create restaurant"
            }
        }
    }

    async editRestaurant(
        owner:User,
        editRestaurantInput:EditRestaurantInput):Promise<EditRestaurantOutput>{
        try{
            const restaurant = await this.restaurants.findOne({where:{id:editRestaurantInput.restaurantId},loadRelationIds:true})
            if(!restaurant)
            {
                return {
                    ok:false,
                    error:'Restaurant not Found'
                }
            }
            if(owner.id !== restaurant.ownerId)
            {
                return {
                    ok:false,
                    error:"Yout can't edit a restaurant that you don't own"
                };
            }
            let category:Category = null;
            if(editRestaurantInput.categoryName){
                category = await this.categories.getOrCreate(editRestaurantInput.categoryName);

            }
            await this.restaurants.save([{
                id:editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                ...(category && {category})

            }])

            return{
                ok:true
            }
        }
        catch(e){
            return{
                ok:false,
                error:e
            }
        }

    }

    async deleteRestaurant(owner:User,deleteRestaurantInput:DeleteRestaurantInput):Promise<DeleteRestaurantOutput>{
        try{
            const restaurant = await this.restaurants.findOne({
                where:{id:deleteRestaurantInput.restaurantId}
            })
            if(!restaurant)
            {
                return {
                    ok:false,
                    error:'Restaurant not Found'
                }
            }
            if(owner.id !== restaurant.ownerId)
            {
                return {
                    ok:false,
                    error:"Yout can't edit a restaurant that you don't own"
                };
            }
            await this.restaurants.delete({id:deleteRestaurantInput.restaurantId});
        }   
        catch(e){
            return {
                ok:false,
                error:e
            };
        }
    }

    async allCategories():Promise<AllCategoriesOuput>{
        try{
            const categories = await this.categories.find();
            return {
                ok:true,
                categories:categories
            }
        }
        catch(e){
            return{
                ok:false,
                error:'Could not load categories',
            };
        }
    }

    countRestaurants(category:Category){
        return this.restaurants.count({
            where:{
                category:{
                    id:category.id
                }
            }
        })
    }
    async findCategoryBySlug({slug,page}:CategoryInput):Promise<CategoryOutput>{
        try{
            const category = await this.categories.findOne({
                where:{
                    slug:slug
                },                
            });
            if(!category)
            {
                return {
                    ok:false,
                    error:'Category not found'
                }
            }
            const restaurants = await this.restaurants.find({
                where:{
                    category:{
                        id:category.id
                    }
                },
                take:25,
                skip:(page-1) * 25,
            })
            const totalResults = await this.countRestaurants(category);
            return{
                ok:true,
                restaurants:restaurants,
                category:category,
                totalPages:Math.ceil(totalResults/25)
                
            }
        }
        catch(e){
            return {
                ok:false,
                error:e   
            }
        }
    }

    async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
        try {
          const [restaurants, totalResults] = await this.restaurants.findAndCount({
            skip: (page - 1) * 25,
            take: 25,
          });
          return {
            ok: true,
            results: restaurants,
            totalPages: Math.ceil(totalResults / 25),
            totalResults,
          };
        } catch {
          return {
            ok: false,
            error: 'Could not load restaurants',
          };
        }
    }

    async findRestaurantById(
        {restaurantId,}:RestaurantInput ):Promise<RestaurantOutput>{
        
        try{
            const restaurant = await this.restaurants.findOne({
                where:{
                    id:restaurantId
                },
                relations:['menu']
            });
            if(!restaurant){
                return {
                    ok:false,
                    error:'Restaurant not found'
                };
            }
            return{
                ok:true,
                restaurant:restaurant
            }
        }
        catch(e){
            return{
                ok:false,
                error:'Could not find restaurant'
            }
        }
    }

    async searchRestaurantByName(
        {query,page}: SearchRestaurantInput):Promise<SearchRestaurantOutput>{
            try{
                const [restaurants, totalResults] = await this.restaurants.findAndCount({
                    where:{
                        name: ILike(`%${query}%`),
                    },
                    skip: (page - 1) * 25,
                    take: 25,
                });
                return {
                    ok:true,
                    restaurants:restaurants,
                    totalResults:totalResults,
                    totalPages: Math.ceil(totalResults / 25),
                }
            }
            catch(e)
            {
                return {
                    ok:false,
                    error:'Could not Search for Reataurants'
                };
            }
        }


        async createDish(
            owner:User, 
            createDishInput:CreateDishInput
        ):Promise<CreateDishOutput>{
            try{
                const restaurant = await this.restaurants.findOne({
                    where:{
                        id:createDishInput.restaurantId
                    }
                });
                if(!restaurant){
                    return{
                        ok:false,
                        error:"Restaurant not Found"
                    };
                }
                if(owner.id !== restaurant.ownerId){
                    return{
                        ok:false,
                        error:"You can't do that"
                    };
                }
                const dish = await this.dishes.save(this.dishes.create({
                    ...createDishInput,
                    restaurant
                }))
                return {
                    ok:true,
                    error:""
                }
            }catch(e){
                return {
                    ok:false,
                    error:"Could not create dish"
                }
            }
        }

        async checkDishOwner(ownerId:number,dishId:number){}


        async editDish(owner:User, editDishInput:EditDishInput):Promise<EditDishOutput>{
            try{
                const dish = await this.dishes.findOne({
                    where:{
                        id:editDishInput.dishId
                    },
                    relations:['restaurant'],
                });
                if(!dish)
                {
                    return {
                        ok:false,
                        error:"Dish not Found"
                    };
                }
                if(dish.restaurant.ownerId !== owner.id){
                    return{
                        ok:false,
                        error:"You can't do that"
                    };
                }
                await this.dishes.save([
                    {
                        id:editDishInput.dishId,
                        ...editDishInput,
                    },
                ]);
                return{
                    ok:true,
                }
            }
            catch(e){
                return {
                    ok:false,
                    error:"Could not delete dish",
                }
            }
        }

        async deleteDish(
            owner:User,
            {dishId}:DeleteDishInput,
        ):Promise<DeleteDishOutput>{
            try{
                const dish = await this.dishes.findOne({
                    where:{
                        id:dishId
                    },
                    relations:['restaurant']
                });
                if(!dish)
                {
                    return{
                        ok:false,
                        error:"Dish not Found",
                    }
                }
                if(dish.restaurant.ownerId !== owner.id){
                    return{
                        ok:false,
                        error:"You can't do that",
                    }
                }
                await this.dishes.delete(dishId)
                return {
                    ok:true
                }
            }
            catch(e){
                return{
                    ok:false,
                    error:"Could not delete Dish",
                }
            }
        }
}