import { Test } from "@nestjs/testing";
import { MailService } from "./mail.service"

describe("MailService",()=>{
    let service:MailService;

    beforeEach(async()=>{
        const module = await Test.createTestingModule({
            providers:[MailService]
        }).compile();
        service = module.get<MailService>(MailService);
    });
    it('should be defined',async ()=>{

    });
});