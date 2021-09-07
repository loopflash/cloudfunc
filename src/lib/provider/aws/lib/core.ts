import { Provider } from '../../../internal';

export abstract class AwsProvider extends Provider{

    private _providerName : string = 'aws';
    protected _event : any = {};
    protected _context : any = {};

    setEvent(event : any){
        this._event = event;
    };

    setContext(context : any){
        this._context = context;
    };

    get providerName(){
        return this._providerName;
    }

}

export function awsFormatMiddleware(
    event : any,
    context : any,
    state : any
){
    return {
        aws: {
            event,
            context,
            state
        }
    }
}