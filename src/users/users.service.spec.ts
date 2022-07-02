import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { Verification } from "./entities/verification.entity";
import { UsersService } from "./users.service"

const mockRepository = () => ({ //페이크 레포지토리 함수 객체를 만든다
    findOne:jest.fn(),
    save:jest.fn(),
    create:jest.fn(),
});

const mockJwtService = { // 제이슨 웹 토큰 페이크 함수 객체를 만든다.
    sign:jest.fn(),
    verify:jest.fn(),
}


const mockMailService = { // 메일 서비스 함수 객체를 만든다.
    sendVerificationEmail:jest.fn(),
}

// Repository<T> <- 여기서 T는 엔티티로 설정이 되어 있는 객체로 가서 ORM의 테이블을 가져 오겠다는 의미임'
// Record<array,type> 형식으로 array 안에 있는 각각의 레코드의 타입을 jest.Mock으로 페이크해서 본다는 의미
// Partial은 어떤 부분적 배열을 가져 올 때 사용

type MockRepository<T = any> = Partial<Record<keyof Repository<User>,jest.Mock>>; // 즉 MockRepository는 사용자의 ORM 페이크 객체 타입이다.

describe("UsersService",()=>{

    let service:UsersService;
    let userRepository:MockRepository<User>;

    beforeAll(async () =>{
        const module = await Test.createTestingModule({
            providers:[
                UsersService,{
                provide:getRepositoryToken(User),
                useValue:mockRepository(),
            },
            {
                provide:getRepositoryToken(Verification),
                useValue:mockRepository(),
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
        const craeteAccountArgs={
            email:'',
            password:'',
            role:0
        }
        it("should fail if user exists",async ()=>{
            userRepository.findOne.mockResolvedValue({
                id:1,
                email:'thewwwwww@naver.com',
            });
            const result = await service.createAccount(craeteAccountArgs);
            expect(result).toMatchObject({
                ok:false,
                error:"There is already a Accout that have same email"
            });
        });
        it("should create a new user",async ()=>{
            userRepository.findOne.mockResolvedValue(undefined); //findOne을 건너뛰게 해주는 곳
            userRepository.create.mockReturnValue(craeteAccountArgs);
            await service.createAccount(craeteAccountArgs);
            expect(userRepository.create).toHaveBeenCalledTimes(1);
            expect(userRepository.create).toHaveBeenCalledWith(craeteAccountArgs);
            expect(userRepository.save).toHaveBeenCalledTimes(1)
            expect(userRepository.save).toHaveBeenCalledWith(craeteAccountArgs)
        })
    })
    it.todo('login')
    it.todo('findById')
    it.todo('editProfile')
    it.todo('verifyEmail')
});
