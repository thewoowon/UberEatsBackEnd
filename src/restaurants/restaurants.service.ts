import { Injectable } from "@nestjs/common";
import { Args } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";

@Injectable()
export class RestaurantService{
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants:Repository<Restaurant>,
        ){}
    getAll():Promise<Restaurant[]>{
        return this.restaurants.find()
    }

    createRestaurant(createRestaurantDto: CreateRestaurantDto):Promise<Restaurant>{
        const newRestaurant = this.restaurants.create(createRestaurantDto);
        return this.restaurants.save(newRestaurant);
    }

}