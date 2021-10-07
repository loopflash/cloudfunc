import {
    Injectable,
    IInterceptor
} from '../../../src';
import { Service1 } from './services/service1';

@Injectable()
export class Interceptor implements IInterceptor{

    constructor(
        private _service : Service1
    ){}

    async intercept(error: any): Promise<any> {
        return {
            status: this._service.getData()
        }
    }

}