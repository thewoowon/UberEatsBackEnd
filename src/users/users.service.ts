import { Injectable, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { exist } from "joi";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users:Repository<User>
    ){}

    usersAll():Promise<User[]>{
        return this.users.find()
    }

    async createAccount({email,password,role}:CreateAccountInput){
        try{
            const exists = await this.users.findOne({
                select:{
                    email:true,
                },
                where:{
                    email:email
                }    
            });
            if(exists)
                return
            await this.users.save(this.users.create({
                email:email,
                password:password,
                role:role
            }))
        }catch(e){
            
        }

        return ;
    }

}