import {
    Injectable,
    IEntryPoint
} from '../../../src';
import { Service1 } from './services/service1';
import { Service3 } from './services/service3';

@Injectable()
export class EntryPoint implements IEntryPoint{

    constructor(
        private _service : Service1,
        private _service2 : Service3
    ){}

    async entry(...args: any[]): Promise<any> {
        return {
            status: this._service.getData() + this._service2.value
        }
    }

}