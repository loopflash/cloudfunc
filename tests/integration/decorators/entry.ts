import {
    Injectable,
    IEntryPoint,
    Middleware
} from '../../../src';
import { GetFar, GetBar ,myMiddleware, myMiddleware2 } from './services/middleware';

@Injectable()
export class EntryPoint implements IEntryPoint{

    constructor(){}

    @Middleware(myMiddleware())
    @Middleware(myMiddleware2())
    async entry(event : any, context : any, @GetBar bar : any, @GetFar far : any): Promise<any> {
        return {
            bar,
            far,
            event,
            context
        };
    }

}