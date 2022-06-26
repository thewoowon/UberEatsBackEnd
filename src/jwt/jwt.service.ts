import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options:JwtModuleOptions
    ){
        //console.log(options);
    }

    sign(payload:object):string{
        return jwt.sign(payload,this.options.privateKey);
    }

    verify(token:string){
        return jwt.verify(token,this.options.privateKey);
    }
}
