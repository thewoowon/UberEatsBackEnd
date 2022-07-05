import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {  DataSource,DataSourceOptions, Repository} from 'typeorm'
import { dropDatabase } from 'typeorm-extension';
import { Verification } from 'src/users/entities/verification.entity';
import { User } from 'src/users/entities/user.entity';
import { getDataSourceToken } from '@nestjs/typeorm';

const GRAPHQL_ENDPOINT = '/graphql';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository:Repository<User>;
  let verificationRepository:Repository<Verification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {

    const options:DataSourceOptions = {
      type:'postgres',
      database:'uber-eats-test',
      host: 'localhost',
      port: 5432,
      username: 'woowon',
      password: 'Ww940706!!',
      synchronize: true,
      logging: false,
      entities:[User,Verification]
    }
    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.driver.connect();
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });

  describe('createAccount',()=>{

    const EMAIL = "thewoowon@naver.com";
    it('should create account',()=>{
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query:`mutation{
          createAccount(input:{
            email:"${EMAIL}"
            password:"Ww940706!!"
            role:Owner
          })
          {
            ok
            error
          }
        }`
      }).expect(200)
      .expect(res =>{
        console.log(res.body);
      })
    });
    it.todo('should fail if account already exists');
  });
  it.todo('userProfile');
  it.todo('login');
  it.todo('me');
  it.todo('verifyEmail');
  it.todo('editProfile');

});
