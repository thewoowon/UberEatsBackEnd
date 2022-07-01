import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service"

const mockRepository = {
    findOne:jest.fn(),
    save:jest.fn(),
    create:jest.fn(),
}

const mockJwtService = {
    sign:jest.fn(),
    verify:jest.fn(),
}


const mockMailService = {
    sendVerificationEmail:jest.fn(),
}

type MockRepository<T = any> = Partial<Record<keyof Repository<User>,jest.Mock>>;

describe("UsersService",()=>{

    let service:UsersService;
    let userRepository:MockRepository<User>;

    beforeAll(async () =>{
        const module = await Test.createTestingModule({
            providers:[
                UsersService,{
                provide:getRepositoryToken(User),
                useValue:mockRepository,
            },
            {
                provide:getRepositoryToken(Verification),
                useValue:mockRepository,
            },
            {
                provide:JwtService,
                useValue:mockJwtService,
            },
            {
                provide:MailService,
                useValue:mockMailService,
            },
        ],
        }).compile();
        service = module.get<UsersService>(UsersService);
        userRepository = module.get(getRepositoryToken(User));
    });
    it('should be defined',()=>{
        expect(service).toBeDefined();
    });

    describe('createAccount',()=>{
        it("should fail if user exists",async ()=>{
            userRepository.findOne.mockResolvedValue({
                id:1,
                email:'thewwwwww@naver.com',
            });
            const result = await service.createAccount({
                email:"thewooooo@naver.com",
                password:"12345",
                role:1 
            });
            expect(result).toMatchObject({
                ok:false,
                error:"There is already a Accout that have same email"
            })
        });
    })
    it.todo('login')
    it.todo('findById')
    it.todo('editProfile')
    it.todo('verifyEmail')
});
