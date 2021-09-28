import { Provider } from '../../../internal';

export abstract class GcpProvider extends Provider{

    private _providerName : string = 'gcp';
    protected _event : any = {};
    protected _context : any = {};

    constructor(){
        super();
    }

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

export function gcpFormatMiddleware(
    event : any,
    context : any,
    state : any
){
    return {
        gcp: {
            event,
            context,
            state
        }
    }
}