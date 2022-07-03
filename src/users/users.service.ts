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
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";
import { MailService } from "src/mail/mail.service";
import { UserProfileOutput } from "./dtos/user-profile.dto";

@Injectable()
export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users:Repository<User>,
        @InjectRepository(Verification) private readonly verifications:Repository<Verification>,
        private readonly jwtService:JwtService,
        private readonly mailService:MailService,
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
            const verification = await this.verifications.save(
                this.verifications.create({
                user:user
                })
            );
            this.mailService.sendVerificationEmail(user.email,verification.code)
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

    async findById(id:number):Promise<UserProfileOutput>{
        try{
            const user = await this.users.findOneOrFail({
                select:{
                    email:true,
                    password:true,
                    id:true,
                    role:true,
                },
                where:{
                    id:id
                }
            });
            return {
                ok:true,
                user:user,
            }
        }
        catch(e)
        {   
            return{
                ok:false,
                error:"User Not Found",
            }
        }
    }

    async editProfile(userId:number,{email,password}:EditProfileInput):Promise<EditProfileOutput>{
        try{
            const user = await this.users.findOne({
                select:{
                    id:true,
                    email:true,
                    password:true,
                    role:true,
                    verified:true,
                },
                where:{
                    id:userId
                }
            });   
            if(email){
                user.email = email;
                user.verified= false;
                const verification = await this.verifications.save(
                    this.verifications.create({user:user})
                );
                this.mailService.sendVerificationEmail(user.email,verification.code)
            }
            if(password){
                user.password = password;
            }
            await this.users.save(user);
            return{
                ok:true
            }
        }
        catch(e){
            return{
                ok:false,error:'Could not update profile'
            };
        }
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
                await this.users.save(verification.user);
                await this.verifications.delete(verification.id);
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
