import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from 'src/database/typeorm-ex.module';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver, DishResolver, RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
    imports:[
        TypeOrmModule.forFeature([Restaurant,Dish]),
        TypeOrmExModule.forCustomRepository([CategoryRepository]),
    ],
    controllers:[],
    providers:[RestaurantResolver,CategoryResolver,DishResolver,RestaurantService]
})
export class RestaurantsModule {
    
}
