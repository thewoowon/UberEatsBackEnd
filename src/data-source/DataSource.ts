import { DataSource } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Verification } from "../users/entities/verification.entity";

export const UberEatsTest = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'uber-eats-test',
    synchronize: true,
    logging: false,
    entities:[User,Verification]
})

