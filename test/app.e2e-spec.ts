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
  let jwtToken: string;
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

    it('should create account',()=>{
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query:`mutation{
          createAccount(input:{
            email:"${testUser.email}"
            password:"${testUser.password}"
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
            email:"${testUser.email}"
            password:"${testUser.password}"
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
  describe('login',()=>{
    it('should login with correct credential',()=>{
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query:`
        mutation{
          login(input:{
            email:"${testUser.email}"
            password:"${testUser.password}"
          }){
            ok
            token
            error
          }
        }
        `
      }).expect(200)
      .expect(res =>{
        const {
          body:{
            data:{login},
          }
        } = res;
        expect(login.ok).toBe(true);
        expect(login.error).toBe(null);
        expect(login.token).toEqual(expect.any(String));
        jwtToken = login.token;
      });
    });
    it('should not be able to login with wrong credentials',()=>{
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .send({
        query:`
        mutation{
          login(input:{
            email:"${testUser.email}"
            password:"1234"
          }){
            ok
            token
            error
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {
          body :{
            data:{login},
          },
        } = res;
        expect(login.ok).toBe(false);
        expect(login.error).toBe('Wrong Password');
        expect(login.token).toBe(null);
      });
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
    });
    it('should not allow logged out user',()=>{
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
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
        console.log(res.body);
        const {
          body:{errors}
        } = res;
        errors[0].messages.toEqual('Forbidden resource');
      })
    })
  });

  describe('editProfile',()=>{
    it('editProfile');
  })
  it.todo('verifyEmail');
});
