import {
    Injectable,
    IEntryPoint,
    Middleware
} from '../../../src';
import { myMiddleware, myMiddlewareModule } from './services/middleware';
import { Service1 } from './services/service1';

@Injectable()
export class EntryPoint implements IEntryPoint{

    constructor(
        private _service : Service1
    ){}

    @Middleware(myMiddleware())
    @Middleware(myMiddlewareModule())
    async entry(...args: any[]): Promise<any> {
        return {
            status: this._service.getData()
        }
    }

}