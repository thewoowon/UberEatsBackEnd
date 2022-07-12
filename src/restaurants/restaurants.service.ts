import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, RelationId, Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOuput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants:Repository<Restaurant>,
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
            category.restaurants = restaurants;
            return{
                ok:true,
                category:category
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