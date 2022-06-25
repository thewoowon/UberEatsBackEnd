import { Injectable, InternalServerErrorException, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { exist } from "joi";
import { Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users:Repository<User>
    ){}

    usersAll():Promise<User[]>{
        return this.users.find()
    }

    async createAccount({email,password,role}: CreateAccountInput):Promise<{ok:boolean,error?:string}>{
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
                return {
                    ok:false,
                    error:"There is already a Accout that have same email"
                };
            await this.users.save(this.users.create({
                email:email,
                password:password,
                role:role
            }));
            return {
                ok:true,
            };
        }catch(e){
            console.log(e);
            return {
                ok:false,
                error:"Couldn't Make a Account from your request"
            };
        }
    }

    async login(
        {email,password} : LoginInput
    ): Promise<{ok:boolean,error?:string,token?:string}>{
        //find the user with the email
        try{
            const user = await this.users.findOne({
                select:{
                    email:true,
                    password:true,
                },
                where:{
                    email:email
                }
            })
            if(!user)
                return{
                    ok: false,
                    error:"User not found"
                }
            // check if the password is correct
            const passwordCorrect = await user.checkPassword(password);
            if(!passwordCorrect)
                return{
                    ok:false,
                    error:"Wrong Password"
                }
            // make a JWT and giv it to the user
            return {
                ok:true,
                token:"ABCDEFG"
            }
        }
        catch(e){
            console.log(e);
            throw new InternalServerErrorException();   
        }
    }


}