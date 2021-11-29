import {
    Injectable,
    IEntryPoint,
    Middleware
} from '../../../src';
import { myMiddleware, myMiddlewareModule, MyMiddlewareService } from './services/middleware';
import { Service1 } from './services/service1';

@Injectable()
export class EntryPoint implements IEntryPoint{

    constructor(
        private _service : Service1
    ){}

    @Middleware(myMiddleware())
    @Middleware(myMiddlewareModule())
    @Middleware(MyMiddlewareService.myMiddleware())
    async entry(...args: any[]): Promise<any> {
        return {
            status: this._service.getData()
        }
    }

}