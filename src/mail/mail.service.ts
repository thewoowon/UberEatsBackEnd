import { Inject, Injectable, Post } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import got from 'got';
import { Domain } from 'domain';
import * as FormData from 'form-data';
import { format } from 'path';

@Injectable()
export class MailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options:MailModuleOptions){
        this.sendEmail('test','testing');
    }

    async sendEmail(subject:string,template:string){
        const form = new FormData();
        form.append("from",`Exited User <mailgun@${this.options.domain}>`);
        form.append("to",`thewoowon@naver.com`);
        form.append("subject",subject);
        form.append("template",template);
        form.append("v:code","thewoowon");
        form.append("v:username","Won");
        const response = await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`,{
                method:"POST",
                headers:{
                    Authorization:`Basic ${Buffer.from(
                        `api:${this.options.apiKey}`,
                    ).toString('base64')}`,
                },
                body:form,
            },
        );
        console.log(response.body);
    }
}
