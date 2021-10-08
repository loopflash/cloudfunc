import {
    Injectable,
    IEntryPoint
} from '../../../src';
import { Service1 } from './services/service1';

@Injectable()
export class EntryPoint implements IEntryPoint{

    constructor(
        private _service : Service1
    ){}

    async entry(...args: any[]): Promise<any> {
        return {
            status: this._service.getData()
        }
    }

}