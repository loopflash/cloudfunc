import { Provider } from '../../../internal';

export abstract class AwsProvider extends Provider{

    protected _event : any;
    protected _context : any;

    setEvent(event : any){
        this._event = event;
    };

    setContext(context : any){
        this._context = context;
    };

}