import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User, UserRole } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { EditOrderInput, EditOrderOutput } from "./entities/edit-order.dto";
import { OrderItem } from "./entities/order-item.entity";
import { Order, OrderStatus } from "./entities/order.entity";

@Injectable()
export class OrderService{
    constructor(
        @InjectRepository(Order)
        private readonly orders:Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Restaurant)
        private readonly restaurants:Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>,

    ){}

    async createOrder(
        customer:User,
        {restaurantId,items}:CreateOrderInput
    ):Promise<CreateOrderOutput>{
        try{
            const restaurant = await this.restaurants.findOne({
                where:{
                    id:restaurantId
                }
            });
            if(!restaurant)
            {
                return{
                    ok:false,
                    error:"Restaurant no Found",
                }
            }

            let orderFinalPrice = 0;
            const orderItems: OrderItem[] = [];
            for (const item of items) {
                const dish = await this.dishes.findOne({
                    where:{
                        id:item.dishId
                    }
                });
                if (!dish) {
                    return {
                        ok: false,
                        error: 'Dish not found.',
                    };
                }
                let dishFinalPrice = dish.price;

                for (const itemOption of item.options) {
                    const dishOption = dish.options.find(
                        dishOption => dishOption.name === itemOption.name,
                    );
                    if (dishOption) {
                        if (dishOption.extra) {
                            dishFinalPrice = dishFinalPrice + dishOption.extra;
                        } 
                        else {
                            const dishOptionChoice = dishOption.choices.find(
                                optionChoice => optionChoice.name === itemOption.choice,
                            );
                            if (dishOptionChoice) {
                                if (dishOptionChoice.extra) {
                                    dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
                                }
                            }
                        }
                    }
                }
                orderFinalPrice = orderFinalPrice + dishFinalPrice;
                const orderItem = await this.orderItems.save(
                this.orderItems.create({
                    dish,
                    options: item.options,
                }),
                );
                orderItems.push(orderItem);
            }
            await this.orders.save(
                this.orders.create({
                  customer,
                  restaurant,
                  total: orderFinalPrice,
                  items: orderItems,
                }),
            );
            return {
                ok: true,
            };
        }
        catch(e){
            return {
                ok: false,
                error: 'Could not create order.',
            };
        }
    }

    async getOrders(user:User,{status}:GetOrdersInput):Promise<GetOrdersOutput>{
        try{
            let orders:Order[];
            if(user.role === UserRole.Client){
                orders = await this.orders.find({
                    where:{
                        customer:{
                            id:user.id,
                        },
                        ...(status &&{status})
                    }
                });
            }
            else if(user.role === UserRole.Delivery)
            {
                orders = await this.orders.find({
                    where:{
                        driver:{
                            id:user.id
                        },
                        ...(status &&{status})
                    }
                });
            }
            else if(user.role === UserRole.Owner){
                const restaurants = await this.restaurants.find({
                    where:{
                        owner:{
                            id:user.id
                        }
                    },
                    relations:['orders']
                });
                orders = restaurants.map(
                    retaurant => retaurant.orders
                ).flat(1);
                if (status) {
                    orders = orders.filter(order => order.status === status);
                }
            }
            return {
                ok:true,
                orders:orders
            }
        }
        catch(e){
            return{
                ok:false,
                error:"Could not Get Orders"
            }
        }
    }
    async getOrder(
        user: User,
        { id: orderId }: GetOrderInput,
      ): Promise<GetOrderOutput> {
        try {
          const order = await this.orders.findOne(
            {
                where:{
                    id:orderId
                },
                relations: ['restaurant'],
          });
          if (!order) {
            return {
              ok: false,
              error: 'Order not found.',
            };
          }
          
          if (!this.canSeeOrder(user,order)) {
            return {
              ok: false,
              error: 'You cant see that',
            };
          }
          return {
            ok: true,
            order,
          };
        } catch {
          return {
            ok: false,
            error: 'Could not load order.',
          };
        }
    }

    canSeeOrder(user:User,order:Order):Boolean{
        let canSee = true;
          if (user.role === UserRole.Client && order.customerId !== user.id) {
            canSee = false;
          }
          if (user.role === UserRole.Delivery && order.driverId !== user.id) {
            canSee = false;
          }
          if (
            user.role === UserRole.Owner &&
            order.restaurant.ownerId !== user.id
          ) {
            canSee = false;
          }

          return canSee;
    }

    async editOrder(
        user:User,
        {id:orderId,status}:EditOrderInput):
        Promise<EditOrderOutput>{
        try{
            const order = await this.orders.findOne({
                where:{
                    id:orderId
                },
                relations:['restaurant']
            })
            if(!order){
                return{
                    ok:false,
                    error:"Order not Found",
                };
            }
            if (!this.canSeeOrder(user,order)) {
                return {
                  ok: false,
                  error: 'You cant see that',
                };
            }
            let catEdit = true;
            if(user.role === UserRole.Client){
                catEdit = false;
            }
            if(user.role === UserRole.Owner){
                if(status === OrderStatus.Cooking || status === OrderStatus.Cooked){
                    catEdit = false;
                }
            }
            if(user.role === UserRole.Delivery){
                if(status === OrderStatus.PickedUp || status === OrderStatus.Delivered){
                    catEdit = false;
                }
            }
            if(!catEdit){
                return{
                    ok:false,
                    error:"You can't do that",
                }
            }
            await this.orders.save([
                {
                    id:orderId,
                    status:status
                }
            ]);
            return{
                ok:true,
            }
        }
        catch(e){
            return{
                ok:false,
                error:"Could not edit Order."
            }
        }
    }
}