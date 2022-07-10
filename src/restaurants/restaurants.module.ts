import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmExModule } from 'src/database/typeorm-ex.module';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantResolver } from './restaurants.resolver';
import { RestaurantService } from './restaurants.service';

@Module({
    imports:[
        TypeOrmModule.forFeature([Restaurant]),
        TypeOrmExModule.forCustomRepository([CategoryRepository]),
    ],
    controllers:[],
    providers:[RestaurantResolver,RestaurantService]
})
export class RestaurantsModule {
    
}
