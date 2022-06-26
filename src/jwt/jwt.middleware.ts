import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";
import { decode } from "punycode";
import { JwtService } from "./jwt.service";
import { UsersService } from "src/users/users.service";

// export function jwtMiddleware(req: Request, res: Response, next: NextFunction)
// {
//     console.log(req.headers);
//     next();
// }

@Injectable()
export class JwtMiddleware implements NestMiddleware{
    constructor(
        private readonly jwtService:JwtService,
        private readonly usersService:UsersService
    ){

    }
    async use(req: Request, res: Response, next: NextFunction) {
        if('x-jwt' in req.headers){
            const token = req.headers['x-jwt'];
            console.log(token);
            const decoded = this.jwtService.verify(token.toString());
            console.log(decoded);
            if(typeof decoded === 'object' && decoded.hasOwnProperty('id')){
                try{
                    const user = await this.usersService.findById(req.headers['id']);
                    req['user'] = user;
                }
                catch(e){

                }
            }
        }
        next();
    }
}