import {
    Inject,
    Injectable,
    Local,
} from '../../../../src';
import { Service2 } from './service2';

@Injectable()
export class Service1{

    constructor(
        @Inject('myService') @Local() private _service : Service2
    ){}

    getData(){
        return this._service.getData();
    }

}