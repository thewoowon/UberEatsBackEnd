import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants:Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories:Repository<Category>,
        ){}


    async getOrCreateCategory(name:string):Promise<Category>{
        const categoryName = name.trim().toLowerCase();
        const categorySlug = categoryName.replace(/ /g,'-');
        let category =  await this.categories.findOne({where:{slug:categorySlug}});
        if(!category){
            category = await this.categories.save(
                this.categories.create({slug:categorySlug,name:categoryName})
            );
        }
        return category;
    }
    async createRestaurant(
        owner:User,
        createRestaurantInput: CreateRestaurantInput):Promise<CreateRestaurantOutput>{
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;
            const category = await this.getOrCreateCategory(createRestaurantInput.categoryName)
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
}