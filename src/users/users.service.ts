import { Injectable, Query } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

export class UsersService{
    constructor(
        @InjectRepository(User) private readonly users:Repository<User>
    ){}

    usersAll():Promise<User[]>{
        return this.users.find()
    }

}