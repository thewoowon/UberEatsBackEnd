import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Category } from './restaurants/entities/category.entity';
import { TypeOrmExModule } from './database/typeorm-ex.module';
import { CategoryRepository } from './restaurants/repositories/category.repository';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:process.env.NODE_ENV==='dev' ? '.env.dev': '.env.test',
      ignoreEnvFile:process.env.NODE_ENV ==='prod',
      validationSchema : Joi.object({
        NODE_ENV:Joi.string().valid('dev','prod','test').required(),
        DB_HOST:Joi.string().required(),
        DB_PORT:Joi.string().required(),
        DB_USERNAME:Joi.string().required(),
        DB_PASSWORD:Joi.string().required(),
        DB_NAME:Joi.string().required(),
        PRIVATE_KEY:Joi.string().required(),
        MAILGUN_API_KEY:Joi.string().required(),
        MAILGUN_DOMAIN_NAME:Joi.string().required(),
        MAILGUN_FROM_EMAIL:Joi.string().required(),
      })
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({req})=>({user:req["user"]}),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !=='prod',
      logging: process.env.NODE_ENV !=='prod' && process.env.NODE_ENV ! == 'test',
      entities:[User,Verification,Restaurant,Category]
    }),
    UsersModule,
    JwtModule.forRoot({
      privateKey:process.env.PRIVATE_KEY
    }),
    MailModule.forRoot({
      apiKey:process.env.MAILGUN_API_KEY,
      domain:process.env.MAILGUN_DOMAIN_NAME,
      fromEmail:process.env.MAILGUN_FROM_EMAIL,
    }),
    RestaurantsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path:"/graphql",
      method:RequestMethod.POST
    })
  }
}
