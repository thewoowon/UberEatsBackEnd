import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {  DataSource,DataSourceOptions, Repository} from 'typeorm'
import { dropDatabase } from 'typeorm-extension';
import { Verification } from 'src/users/entities/verification.entity';
import { User } from 'src/users/entities/user.entity';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';


jest.mock('got',()=>{
  return {
    post:jest.fn(),
  }
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'thewoowon@naver.com',
  password: 'Ww940706!!',
};


describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository:Repository<User>;
  let jwtToken: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJ0aGV3b293b25AbmF2ZXIuY29tIiwiaWF0IjoxNjU3MTE2MzM5fQ.VEXSG2IduCNY_h7pCx2x_lJrNGv-7HJZf92Q2zl5oY8";
  let verificationRepository:Repository<Verification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
        expect(res.body.data.createAccount.ok).toBe(true);
        expect(res.body.data.createAccount.error).toBe(null);
      });
    });
    it('should fail if account already exists',()=>{
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
        expect(res.body.data.createAccount.ok).toBe(false);
        expect(res.body.data.createAccount.error).toEqual("There is already a Accout that have same email");
      })
    });
  });
  describe('userProfile',()=>{
    let userId:number;
    beforeAll(async ()=>{
      const [user] =  await userRepository.find();
      userId = user.id;
    });
    it('should see a user\'s profile',()=>{
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set(`X-JWT`,jwtToken)
      .send({
        query:`
        {
          userProfile(userId:${userId}){
            ok
            error
            user{
              id
            }
          }
        }
        `
      }).expect(200)
      .expect(res => {
        console.log(res);
        const {
          body:{
            data:{
              userProfile:{
                ok,
                error,
                user:{id}
              }
            }
          }
        } = res;
        expect(ok).toBe(true);
        expect(error).toBe(null);
        expect(id).toBe(userId);
      });
    });
    it('should not find a profile',()=>{
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set(`X-JWT`,jwtToken)
      .send({
        query:`
        {
          userProfile(userId:666){
            ok
            error
            user{
              id
            }
          }
        }
        `
      }).expect(200)
      .expect(res => {
        const {
          body:{
            data:{
              userProfile:{
                ok,
                error,
                user
              }
            }
          }
        } = res;
        expect(ok).toBe(false);
        expect(error).toBe("User Not Found");
        expect(user).toBe(null);
      });
    });
  });
  it.todo('login');
  describe('me',()=>{
    it('should find my profile',()=>{
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set(`X-JWT`,jwtToken)
      .send({
        query:`
        {
          me{
            email
          }
        }
        `
      }).expect(200)
      .expect(res =>{
        const {
          body:{
            data:{
              me:{email},
            },
          },
        } = res;
        expect(email).toBe(testUser.email);
      });
    })
  });
  it.todo('verifyEmail');
  it.todo('editProfile');

});
