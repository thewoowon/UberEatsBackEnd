import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModuleOptions } from './interfaces/jwt-module-options.interface';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
    static forRoot(options:JwtModuleOptions):DynamicModule{
        return {
            module:JwtModule,
            exports:[JwtService],
            providers:[{
                provide:'APPLES',
                useValue:options
            }
            ,JwtService,
        ],

        }
    }
}
