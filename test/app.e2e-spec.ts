import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {  DataSource,DataSourceOptions, Repository} from 'typeorm'
import { dropDatabase } from 'typeorm-extension';
import { Verification } from 'src/users/entities/verification.entity';
import { User } from 'src/users/entities/user.entity';
import { getDataSourceToken, getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { send } from 'process';


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

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest()
      .set('X-JWT', jwtToken)
      .send({ query });


  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(getRepositoryToken(Verification));
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
            password
            role
          }
        }
        `
      }).expect(200)
      .expect(res =>{
        console.log(res.body);
        const {
          body:{errors}
        } = res;
        const [error] = errors;
        expect(error.message).toBe('Forbidden resource');
      })
    })
  });

  describe('editProfile',()=>{
    const NEW_EMAIL = "thewoowww@naver.com";
    it('should change email',()=>{
      return request(app.getHttpServer())
      .post(GRAPHQL_ENDPOINT)
      .set("X-JWT",jwtToken)
      .send({
        query:`
        mutation{
          editProfile(input:{
            email:"${NEW_EMAIL}"
          }){
            ok
            error
          }
        }
        `
      }).expect(200)
      .expect(res =>{
        console.log(res.body);
        const {
          body:{
            data:{
              editProfile:{
                ok,
                error
              }
            }
          },
        }= res;
        expect(ok).toBe(true);
        expect(error).toBe(null);
      });
    });
    it('should have new email',()=>{
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
          expect(email).toBe(NEW_EMAIL);
        });
    })
  })
  describe('verifyEmail',()=>{
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            verifyEmail(input:{
              code:"${verificationCode}"
            }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should fail on verification code not found', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            verifyEmail(input:{
              code:"xxxxx"
            }){
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification not found');
        });
    });
  });
});
