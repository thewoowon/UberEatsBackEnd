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
        console.log(options);
    }

    async sendEmail(subject:string,content:string){
        const form = new FormData();
        form.append("form",`Exited User <mailgun@${this.options.domain}>`);
        form.append("to",`thewoowon@naver.com`);
        form.append("subject",subject);
        const response = await form.append("text",content);
        got(`https://api.mailgun.net/v3/${this.options.domain}/messages`,{
            method:"POST",
            headers:{
                "Authorization":`Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}`,
            },
            body:form,
        });
    }
}
