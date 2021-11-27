import {
    Injectable,
} from '../../../../src';
import { Service2 } from './service2';

@Injectable()
export class Service1{

    constructor(
        private _service : Service2
    ){}

    getData(){
        return this._service.getData();
    }

}