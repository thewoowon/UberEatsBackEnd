import { Global, Injectable, InternalServerErrorException, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { exist, object } from "joi";
import { RelationId, Repository } from "typeorm";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import * as Jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users:Repository<User>,
        @InjectRepository(Verification) private readonly verifications:Repository<Verification>,
        private readonly jwtService:JwtService,
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
            const user =  await this.users.save(this.users.create({
                email:email,
                password:password,
                role:role
            }));
            // 여기에 이메일 인증 기능이 들어간다.
            await this.verifications.save(this.verifications.create({
                user:user
            }))

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
                    id:true,
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
            const token = this.jwtService.sign({id:user.id,email:user.email});
            return {
                ok:true,
                token:token,
            }
        }
        catch(e){
            console.log(e);
            throw new InternalServerErrorException();   
        }
    }

    async findById(id:number):Promise<User>{
        return this.users.findOne({
            select:{
                email:true,
                password:true,
                id:true,
                role:true,
            },
            where:{
                id:id
            }
        })
    }

    async editProfile(userId:number,{email,password}:EditProfileInput):Promise<User>{
        const user = await this.users.findOne({
            select:{
                id:true,
                email:true,
                password:true,
                role:true,
            },
            where:{
                id:userId
            }
        });
        if(email)
        {
            user.email = email;
            user.verified= false;
            await this.verifications.save(this.verifications.create({user:user}));
        }
        if(password)
        {
            user.password = password;
        }
        return await this.users.save(user);
    }

    async verifyEmail(code:string):Promise<boolean>{
        try{
            const verification = await this.verifications.findOne({
                relations:['user'],
                where:{
                    code:code
                },
            })
    
            if(verification)
            {
                verification.user.verified = true;
                this.users.save(verification.user);
                return true;
            }
            throw new Error();
        }
        catch(e)
        {
            console.log(e);
            return false;
        }
    }
}
